// Shared chrome for the hand-rolled MUI modals (cloud cost drilldown,
// external cost details).

const modalCenterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const paperBaseStyle = {
  backgroundColor: "var(--cds-layer)",
  color: "var(--cds-text-primary)",
  border: "1px solid var(--cds-border-subtle)",
  borderRadius: "8px",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  padding: "24px",
  width: "90%",
  overflowY: "auto",
  outline: "none",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  borderBottom: "1px solid var(--cds-border-subtle)",
  paddingBottom: "12px",
};

const titleStyle = {
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "var(--cds-text-primary)",
  fontFamily: '"IBM Plex Sans", sans-serif',
};

const ThemedModalHeader = ({ title, titleId, onClose }) => (
  <div style={headerStyle}>
    <h3 id={titleId} style={titleStyle}>
      {title}
    </h3>
    <button
      type="button"
      className="themed-modal-close"
      aria-label="Close"
      onClick={onClose}
    >
      &times;
    </button>
  </div>
);

export { ThemedModalHeader, modalCenterStyle, paperBaseStyle };
