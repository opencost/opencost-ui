import { InlineNotification, ActionableNotification } from "@carbon/react";

const Warnings = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      {warnings.map((warning, index) => {
        if (warning.action) {
          return (
            <ActionableNotification
              key={index}
              kind="warning"
              lowContrast
              title={warning.primary}
              subtitle={warning.secondary}
              actionButtonLabel={warning.actionLabel || "Action"}
              onActionButtonClick={warning.onAction}
              style={{ marginBottom: "0.5rem", maxWidth: "100%" }}
            />
          );
        }

        return (
          <InlineNotification
            key={index}
            kind="warning"
            lowContrast
            title={warning.primary}
            subtitle={warning.secondary}
            style={{ marginBottom: "0.5rem", maxWidth: "100%" }}
          />
        );
      })}
    </div>
  );
};

export default Warnings;
