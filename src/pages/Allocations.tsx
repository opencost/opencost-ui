import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { find, get, sortBy, toArray } from "lodash";
import { Button, Checkbox, Loading, Tile } from "@carbon/react";
import { Renew } from "@carbon/icons-react";

import Page from "../components/Page";
import Header from "../components/Header";
import Controls from "../components/Controls";
import FilterBreadcrumb from "../components/FilterBreadcrumb";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import AllocationReport from "../components/allocationReport";
import AllocationService from "../services/allocation";
import {
  checkCustomWindow,
  cumulativeToTotals,
  parseFilters,
  parseFiltersFromUrl,
  rangeToCumulative,
  toVerboseTimeRange,
} from "../util";
import { currencyCodes } from "../constants/currencyCodes";
import { AllocationData } from "../types/allocation";

const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
];

const aggregationOptions = [
  { name: "Cluster", value: "cluster" },
  { name: "Node", value: "node" },
  { name: "Namespace", value: "namespace" },
  { name: "Controller Kind", value: "controllerKind" },
  { name: "Controller", value: "controller" },
  { name: "DaemonSet", value: "daemonset" },
  { name: "Deployment", value: "deployment" },
  { name: "Job", value: "job" },
  { name: "Service", value: "service" },
  { name: "StatefulSet", value: "statefulset" },
  { name: "Pod", value: "pod" },
  { name: "Container", value: "container" },
];

const accumulateOptions = [
  { name: "Entire window", value: true },
  { name: "Daily", value: false },
];

function generateTitle({ window, aggregateBy, accumulate }) {
  let windowName = get(find(windowOptions, { value: window }), "name", "");
  if (windowName === "") {
    if (checkCustomWindow(window)) {
      windowName = toVerboseTimeRange(window);
    } else {
      console.warn(`unknown window: ${window}`);
    }
  }

  let aggregationName = get(
    find(aggregationOptions, { value: aggregateBy }),
    "name",
    "",
  ).toLowerCase();
  if (aggregationName === "") {
    console.warn(`unknown aggregation: ${aggregateBy}`);
  }

  let str = `${windowName} by ${aggregationName}`;

  if (!accumulate) {
    str = `${str} daily`;
  }

  return str;
}

const ReportsPage = () => {
  const [allocationData, setAllocationData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState<AllocationData[]>([]);
  const [totalData, setTotalData] = useState({});

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [includeIdle, setIncludeIdle] = useState(true);

  useEffect(() => {
    const cumulative = rangeToCumulative(allocationData, aggregateBy);
    setCumulativeData(toArray(cumulative));
    setTotalData(cumulativeToTotals(cumulative));
  }, [allocationData]);

  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const navigate = useNavigate();

  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "namespace";
  const accumulate = searchParams.get("acc") === "true";
  const currency = searchParams.get("currency") || "USD";
  const title =
    searchParams.get("title") ||
    generateTitle({ window: win, aggregateBy, accumulate });

  const filterParam = searchParams.get("filter");
  const filters = useMemo(() => {
    return filterParam ? parseFiltersFromUrl(filterParam) : [];
  }, [filterParam]);

  useEffect(() => {
    const aggregateHierarchy = ["namespace", "controllerKind", "controller", "pod", "container"];
    const filterHierarchy = ["namespace", "controllerKind", "controllerName", "pod", "container"];
    
    const aggregateToFilterCount = {
      namespace: 0,
      controllerKind: 1,
      controller: 2,
      pod: 3,
      container: 4,
    };
    
    const currentIndex = aggregateHierarchy.indexOf(aggregateBy);
    const currentFilters = filterParam ? parseFiltersFromUrl(filterParam) : [];
    const expectedFilterCount = aggregateToFilterCount[aggregateBy] || 0;
    
    if (currentIndex === 0 && currentFilters.length > 0) {
      const newSearchParams = new URLSearchParams(routerLocation.search);
      newSearchParams.delete("filter");
      const newSearch = `?${newSearchParams.toString()}`;
      if (routerLocation.search !== newSearch) {
        navigate({ search: newSearch }, { replace: true });
      }
      return;
    }
    
    if (currentFilters.length > expectedFilterCount) {
      const trimmedFilters = currentFilters.slice(0, expectedFilterCount);
      const newSearchParams = new URLSearchParams(routerLocation.search);
      if (trimmedFilters.length > 0) {
        newSearchParams.set("filter", parseFilters(trimmedFilters));
      } else {
        newSearchParams.delete("filter");
      }
      const newSearch = `?${newSearchParams.toString()}`;
      if (routerLocation.search !== newSearch) {
        navigate({ search: newSearch }, { replace: true });
      }
      return;
    }
    
    for (let i = 0; i < currentFilters.length; i++) {
      const filter = currentFilters[i];
      const expectedProperty = filterHierarchy[i];
      if (filter.property !== expectedProperty) {
        const trimmedFilters = currentFilters.slice(0, i);
        const newSearchParams = new URLSearchParams(routerLocation.search);
        if (trimmedFilters.length > 0) {
          newSearchParams.set("filter", parseFilters(trimmedFilters));
        } else {
          newSearchParams.delete("filter");
        }
        const newSearch = `?${newSearchParams.toString()}`;
        if (routerLocation.search !== newSearch) {
          navigate({ search: newSearch }, { replace: true });
        }
        return;
      }
    }
  }, [routerLocation.search, aggregateBy]);

  useEffect(() => {
    fetchData();
  }, [win, aggregateBy, accumulate, filters, includeIdle]);

  async function fetchData() {
    setLoading(true);
    setErrors([]);

    try {
      const resp = await AllocationService.fetchAllocation(win, aggregateBy, {
        accumulate,
        filters,
        includeIdle,
      });
      if (resp.data && resp.data.length > 0) {
        const allocationRange = resp.data;
        for (const i in allocationRange) {
          allocationRange[i] = sortBy(allocationRange[i], (a) => a.totalCost);
        }
        setAllocationData(allocationRange);
      } else {
        if (resp.message && resp.message.indexOf("boundary error") >= 0) {
          let match = resp.message.match(/(ETL is \d+\.\d+% complete)/);
          let secondary = "Try again after ETL build is complete";
          if (match && match.length > 0) {
            secondary = `${match[1]}. ${secondary}`;
          }
          setErrors([
            {
              primary: "Data unavailable while ETL is building",
              secondary: secondary,
            },
          ]);
        }
        setAllocationData([]);
      }
    } catch (err) {
      if (err.message.indexOf("404") === 0) {
        setErrors([
          {
            primary: "Failed to load report data",
            secondary:
              "Please update OpenCost to the latest version, then open an Issue on GitHub if problems persist.",
          },
        ]);
      } else {
        let secondary = "Please open an Issue on GitHub if problems persist.";
        if (err.message.length > 0) {
          secondary = err.message;
        }
        setErrors([
          {
            primary: "Failed to load report data",
            secondary: secondary,
          },
        ]);
      }
      setAllocationData([]);
    }

    setLoading(false);
  }

  function handleBreadcrumbNavigate(level) {
    const aggregateHierarchy = ["namespace", "controllerKind", "controller", "pod", "container"];

    if (level === -1) {
      const newSearchParams = new URLSearchParams(routerLocation.search);
      newSearchParams.set("agg", "namespace");
      newSearchParams.delete("filter");
      navigate({
        search: `?${newSearchParams.toString()}`,
      });
      return;
    }

    const trimmedFilters = filters.slice(0, level + 1);
    if (trimmedFilters.length === 0) {
      const newSearchParams = new URLSearchParams(routerLocation.search);
      newSearchParams.set("agg", "namespace");
      newSearchParams.delete("filter");
      navigate({
        search: `?${newSearchParams.toString()}`,
      });
      return;
    }

    const targetAgg = aggregateHierarchy[trimmedFilters.length] || "namespace";

    const newSearchParams = new URLSearchParams(routerLocation.search);
    newSearchParams.set("agg", targetAgg);
    if (trimmedFilters.length > 0) {
      newSearchParams.set("filter", parseFilters(trimmedFilters));
    } else {
      newSearchParams.delete("filter");
    }
    navigate({
      search: `?${newSearchParams.toString()}`,
    });
  }

  function drilldown(row) {
    const drilldownHierarchy = {
      namespace: "controllerKind",
      controllerKind: "controller",
      controller: "pod",
      pod: "container",
    };

    const nextAgg = drilldownHierarchy[aggregateBy];
    
    if (!nextAgg) {
      return;
    }

    if (!row.name || String(row.name).trim() === "") {
      return;
    }
    
    const filterPropertyMap = {
      namespace: "namespace",
      controllerKind: "controllerKind",
      controller: "controllerName",
      pod: "pod",
      container: "container",
    };
    
    const filterProperty = filterPropertyMap[aggregateBy] || aggregateBy;
    
    let filterValue = String(row.name).trim();
    let updatedFilters = [...filters];

    if (aggregateBy === "controller" && filterValue.includes(":")) {
      const [maybeKind, ...nameParts] = filterValue.split(":");
      const trimmedName = nameParts.join(":").trim();
      if (trimmedName.length > 0) {
        filterValue = trimmedName;
      }

      const normalizedKind = maybeKind.trim();
      if (
        normalizedKind.length > 0 &&
        !updatedFilters.some((f) => f.property === "controllerKind")
      ) {
        updatedFilters = [
          ...updatedFilters,
          {
            property: "controllerKind",
            value: normalizedKind,
          },
        ];
      }
    }

    const newFilter = {
      property: filterProperty,
      value: filterValue,
    };

    const newFilters = [...updatedFilters, newFilter];
    
    const newSearchParams = new URLSearchParams(routerLocation.search);
    newSearchParams.set("agg", nextAgg);
    if (newFilters.length > 0) {
      newSearchParams.set("filter", parseFilters(newFilters));
    } else {
      newSearchParams.delete("filter");
    }
    navigate({
      search: `?${newSearchParams.toString()}`,
    });
  }

  return (
    <Page>
      <Header headerTitle="Cost Allocation">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Checkbox
            labelText="Include idle costs"
            checked={includeIdle}
            onChange={(e, { checked }) => setIncludeIdle(checked)}
            id="include-idle"
          />
          <Button
            kind="ghost"
            renderIcon={() => <Renew size={24} />}
            iconDescription="Refresh"
            onClick={() => fetchData()}
            hasIconOnly
            tooltipPosition="bottom"
          />
        </div>
      </Header>

      {!loading && errors.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <Warnings warnings={errors} />
        </div>
      )}

      <Tile>
        <div style={{ display: "flex", flexFlow: "row", padding: "1.5rem" }}>
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{title}</h3>
            <FilterBreadcrumb filters={filters} onNavigate={handleBreadcrumbNavigate} />
            <Subtitle report={{ window: win, aggregateBy }} />
          </div>

          <Controls
            windowOptions={windowOptions}
            window={win}
            setWindow={(win) => {
              searchParams.set("window", win);
              navigate({
                search: `?${searchParams.toString()}`,
              });
            }}
            aggregationOptions={aggregationOptions}
            aggregateBy={aggregateBy}
            setAggregateBy={(agg) => {
              const newSearchParams = new URLSearchParams(routerLocation.search);
              newSearchParams.set("agg", agg);
              newSearchParams.delete("filter");
              navigate({
                search: `?${newSearchParams.toString()}`,
              });
            }}
            accumulateOptions={accumulateOptions}
            accumulate={accumulate}
            setAccumulate={(acc) => {
              searchParams.set("acc", String(acc));
              navigate({
                search: `?${searchParams.toString()}`,
              });
            }}
            title={title}
            cumulativeData={cumulativeData}
            currency={currency}
            currencyOptions={currencyCodes}
            setCurrency={(curr) => {
              searchParams.set("currency", curr);
              navigate({
                search: `?${searchParams.toString()}`,
              });
            }}
          />
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loading description="Loading allocation data..." withOverlay={false} />
          </div>
        )}

        {!loading && (
          <AllocationReport
            allocationData={allocationData}
            cumulativeData={cumulativeData}
            totalData={totalData}
            currency={currency}
            aggregateBy={aggregateBy}
            drilldown={drilldown}
          />
        )}
      </Tile>
    </Page>
  );
};

export default React.memo(ReportsPage);
