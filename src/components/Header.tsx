import { Breadcrumb, BreadcrumbItem, Heading } from "@carbon/react";

const PageHeader = ({ headerTitle, breadcrumbItems = [], children }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        padding: "1rem 0",
      }}
    >
      <div>
        {breadcrumbItems.length > 0 && (
          <Breadcrumb>
            {breadcrumbItems.map((item, index) => (
              <BreadcrumbItem
                key={index}
                href={item.href}
                isCurrentPage={index === breadcrumbItems.length - 1}
              >
                {item.label}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        )}
        <Heading
          style={{
            fontSize: "2.25rem",
            fontWeight: 500,
            fontFamily: '"Lexend", sans-serif',
            marginTop: "0.5rem",
            marginBottom: 0,
          }}
        >
          {headerTitle}
        </Heading>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
