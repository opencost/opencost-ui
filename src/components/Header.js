import { Heading, Breadcrumb, BreadcrumbItem, Link  } from '@carbon/react';

const Header = (props) => {
  const { title, breadcrumbs, headerTitle } = props;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexFlow: "row",
        width: "100%",
        marginTop: "10px",
      }}
    >
      <Heading style={{ marginBottom: "10px" }}>
        {headerTitle}
      </Heading>
      <div style={{ flex: "1 0 auto" }}>
        {title}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb aria-label="breadcrumb">
            {breadcrumbs.slice(0, breadcrumbs.length - 1).map((b) => (
              <BreadcrumbItem key={b.name}>
                <Link href={b.href}>{b.name}</Link>
              </BreadcrumbItem>
            ))}
            <BreadcrumbItem>
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
