import { Heading, Breadcrumb, BreadcrumbItem } from "@carbon/react";

const Header = (props) => {
  const { title, breadcrumbs, headerTitle } = props;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexFlow: "row",
        width: "100%",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <Heading style={{ marginBottom: "0.5rem", marginRight: "2rem" }}>
        {headerTitle}
      </Heading>
      <div style={{ flex: "1 0 auto" }}>
        {title && (
          <Heading style={{ marginBottom: "0.5rem" }}>
            {title}
          </Heading>
        )}
        {breadcrumbs && breadcrumbs.length > 0 && (
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
        )}
      </div>
      <div style={{ flex: "0 0 auto" }}>{props.children}</div>
    </div>
  );
};

export default Header;
