import * as React from "react";
import { upperFirst } from "lodash";
import { Breadcrumb, BreadcrumbItem } from "@carbon/react";
import { toVerboseTimeRange } from "../util";

const Subtitle = ({ report, onClick }) => {
  const { aggregateBy, window } = report;

  const subtitleText = aggregateBy && aggregateBy.length > 0 
    ? `${toVerboseTimeRange(window)} by ${upperFirst(aggregateBy)}`
    : toVerboseTimeRange(window);

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <Breadcrumb noTrailingSlash onClick={onClick}>
        <BreadcrumbItem href="#" isCurrentPage>
          {subtitleText}
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
};

export default React.memo(Subtitle);
