import React from "react";
import { Modal } from "@carbon/react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onRequestClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  open,
  onRequestClose,
}) => {
  const shortcuts = [
    { section: "Global", keys: ["/"], description: "Show keyboard shortcuts" },
    {
      section: "Navigation",
      keys: ["Shift + A"],
      description: "Go to Allocations",
    },
    { section: "Navigation", keys: ["Shift + S"], description: "Go to Assets" },
    {
      section: "Navigation",
      keys: ["Shift + C"],
      description: "Go to Cloud Costs",
    },
    {
      section: "Navigation",
      keys: ["Shift + E"],
      description: "Go to External Costs",
    },
    { section: "Data", keys: ["R"], description: "Refresh current view" },
  ];

  return (
    <Modal
      open={open}
      onRequestClose={onRequestClose}
      modalHeading="Keyboard Shortcuts"
      passiveModal
      size="sm"
      className="keyboard-shortcuts-modal"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {["Global", "Navigation", "Data"].map((section) => (
          <div key={section}>
            <h5
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--cds-text-secondary)",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {section}
            </h5>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              {shortcuts
                .filter((s) => s.section === section)
                .map((shortcut) => (
                  <div
                    key={shortcut.description}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid var(--cds-border-subtle-01)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--cds-text-primary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {shortcut.description}
                    </span>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          style={{
                            display: "inline-block",
                            padding: "0.125rem 0.375rem",
                            fontSize: "0.75rem",
                            lineHeight: "1rem",
                            color: "var(--cds-text-primary)",
                            backgroundColor: "var(--cds-layer-02)",
                            border: "1px solid var(--cds-border-subtle)",
                            borderRadius: "3px",
                            fontFamily: "monospace",
                            boxShadow: "0 1px 0 var(--cds-border-subtle)",
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default KeyboardShortcutsModal;
