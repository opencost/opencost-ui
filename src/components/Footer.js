import { Parser as HtmlToReactParser } from "html-to-react";

const Footer = () => {
  return (
    <div style={{ padding: "40px", textAlign: "center", borderTop: "1px solid #e5e5e5", marginTop: "40px", color: "#6b7280" }}>
      <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>OpenCost - The Open Source Cost Standard for Kubernetes</p>
      <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.7 }}>v1.109.0 • Apache 2.0 • CNCF Sandbox Project</p>
    </div>
  );
};

export default Footer;
