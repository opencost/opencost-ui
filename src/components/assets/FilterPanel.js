import PropTypes from "prop-types";
import {
  Checkbox,
  Search,
  Button,
  Toggle,
  Accordion,
  AccordionItem,
} from "@carbon/react";

const FilterPanel = ({
  filters,
  onFiltersChange,
  filterOptions,
  useMockData,
  onMockDataToggle,
}) => {

  const handleStatusChange = (status) => {
    const updated = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: updated });
  };

  const handleAssetTypeChange = (type) => {
    const updated = filters.assetType.includes(type)
      ? filters.assetType.filter((t) => t !== type)
      : [...filters.assetType, type];
    onFiltersChange({ ...filters, assetType: updated });
  };

  const handleStorageClassChange = (sc) => {
    const updated = filters.storageClass.includes(sc)
      ? filters.storageClass.filter((s) => s !== sc)
      : [...filters.storageClass, sc];
    onFiltersChange({ ...filters, storageClass: updated });
  };

  const handleClusterChange = (cluster) => {
    const updated = filters.cluster.includes(cluster)
      ? filters.cluster.filter((c) => c !== cluster)
      : [...filters.cluster, cluster];
    onFiltersChange({ ...filters, cluster: updated });
  };

  const handleSearchChange = (e) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: [],
      assetType: [],
      storageClass: [],
      cluster: [],
      search: "",
    });
  };

  const activeFilterCount =
    filters.status.length +
    filters.assetType.length +
    filters.storageClass.length +
    filters.cluster.length +
    (filters.search ? 1 : 0);

  return (
    <div className="filter-panel-carbon">
      <div style={{ marginBottom: "1rem" }}>
        <Search
          size="md"
          placeholder="Search by name, namespace, or cluster..."
          labelText="Search assets"
          value={filters.search}
          onChange={(e) => handleSearchChange(e)}
        />
      </div>

      <Accordion>
        <AccordionItem title={`Filters ${activeFilterCount > 0 ? `(${activeFilterCount})` : ""}`}>
          <div className="filter-options">
            <fieldset className="filter-group">
              <legend className="filter-label">Status</legend>
              {["ok", "review", "waste"].map((status) => (
                <Checkbox
                  key={status}
                  id={`status-${status}`}
                  labelText={status.charAt(0).toUpperCase() + status.slice(1)}
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusChange(status)}
                />
              ))}
            </fieldset>

            {filterOptions.assetTypes && filterOptions.assetTypes.length > 0 && (
              <fieldset className="filter-group">
                <legend className="filter-label">Asset Type</legend>
                {filterOptions.assetTypes.map((type) => (
                  <Checkbox
                    key={type}
                    id={`assetType-${type}`}
                    labelText={type}
                    checked={filters.assetType.includes(type)}
                    onChange={() => handleAssetTypeChange(type)}
                  />
                ))}
              </fieldset>
            )}

            {filterOptions.storageClasses && filterOptions.storageClasses.length > 0 && (
              <fieldset className="filter-group">
                <legend className="filter-label">Storage Class</legend>
                {filterOptions.storageClasses.map((sc) => (
                  <Checkbox
                    key={sc}
                    id={`storageClass-${sc}`}
                    labelText={sc || "Unspecified"}
                    checked={filters.storageClass.includes(sc)}
                    onChange={() => handleStorageClassChange(sc)}
                  />
                ))}
              </fieldset>
            )}

            {filterOptions.clusters && filterOptions.clusters.length > 0 && (
              <fieldset className="filter-group">
                <legend className="filter-label">Cluster</legend>
                {filterOptions.clusters.map((cluster) => (
                  <Checkbox
                    key={cluster}
                    id={`cluster-${cluster}`}
                    labelText={cluster}
                    checked={filters.cluster.includes(cluster)}
                    onChange={() => handleClusterChange(cluster)}
                  />
                ))}
              </fieldset>
            )}

            {process.env.NODE_ENV === "development" && (
              <div className="filter-group">
                <Toggle
                  id="mock-data-toggle"
                  labelText="Use Mock Data (Dev Mode)"
                  toggled={useMockData}
                  onToggle={(checked) => onMockDataToggle(checked)}
                />
              </div>
            )}

            {activeFilterCount > 0 && (
              <Button
                kind="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear all filters
              </Button>
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.array,
    assetType: PropTypes.array,
    storageClass: PropTypes.array,
    cluster: PropTypes.array,
    search: PropTypes.string,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  filterOptions: PropTypes.shape({
    clusters: PropTypes.array,
    storageClasses: PropTypes.array,
    assetTypes: PropTypes.array,
  }).isRequired,
  useMockData: PropTypes.bool,
  onMockDataToggle: PropTypes.func,
};

export default FilterPanel;
