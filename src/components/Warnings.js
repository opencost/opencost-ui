import { InlineNotification, ActionableNotification } from "@carbon/react";

const Warnings = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {warnings.map((warn, i) => {
        const hasInteractiveContent = typeof warn.secondary !== "string" && warn.secondary;
        
        if (hasInteractiveContent) {
          return (
            <ActionableNotification
              key={i}
              kind="warning"
              title={warn.primary}
              inline
              lowContrast
              hideCloseButton
            >
              {warn.secondary}
            </ActionableNotification>
          );
        }
        
        return (
          <InlineNotification
            key={i}
            kind="warning"
            title={warn.primary}
            subtitle={warn.secondary}
            lowContrast
          />
        );
      })}
    </div>
  );
};

export default Warnings;
