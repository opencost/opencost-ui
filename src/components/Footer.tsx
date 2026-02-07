import { Link } from "@carbon/react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <div style={{ marginTop: "auto", width: "100%" }}>
      <div style={{ height: "2rem" }} />
      <div
        style={{
          width: "100%",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderTop: "1px solid var(--cds-border-subtle-01)",
          backgroundColor: "var(--cds-layer-01)",
          fontSize: "0.75rem",
          color: "var(--cds-text-secondary)",
        }}
      >
        <span>
          © {year} OpenCost. All rights reserved. {" "}
          <Link href="https://opencost.io" target="_blank" rel="noopener noreferrer">
            opencost.io
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Footer;
