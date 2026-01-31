import * as React from "react";
import { Heading, Breadcrumb, BreadcrumbItem } from "@carbon/react";

const PageHeader = ({ headerTitle, title, breadcrumbs, children }) => {
  return (
    <div
      style={{
        marginBottom: "2rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid var(--opencost-border)",
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ marginBottom: "0.5rem" }}>
          <Breadcrumb noTrailingSlash>
            {breadcrumbs.slice(0, breadcrumbs.length - 1).map((b) => (
              <BreadcrumbItem href={b.href} key={b.name}>
                {b.name}
              </BreadcrumbItem>
            ))}
            <BreadcrumbItem isCurrentPage>
              {breadcrumbs[breadcrumbs.length - 1].name}
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ flex: "1 1 auto" }}>
          <Heading style={{ marginBottom: "0.5rem" }}>
            {headerTitle}
          </Heading>
          {title && (
            <p style={{ color: "var(--opencost-text-secondary)", fontSize: "0.875rem", margin: 0 }}>
              {title}
            </p>
          )}
        </div>
        {children && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexShrink: 0,
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
