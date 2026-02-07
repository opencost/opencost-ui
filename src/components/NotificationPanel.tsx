import React from "react";
import {
  HeaderPanel,
  Switcher,
  SwitcherItem,
  SwitcherDivider,
} from "@carbon/react";
import { CheckmarkFilled, WarningFilled, ErrorFilled, InformationFilled } from "@carbon/icons-react";

interface Notification {
  id: string;
  kind: "success" | "warning" | "error" | "info";
  title: string;
  subtitle: string;
  timestamp: string;
}

interface NotificationPanelProps {
  expanded: boolean;
  onDismiss: () => void;
}

const mockNotifications: Notification[] = [];

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  expanded,
  onDismiss,
}) => {
  const getIcon = (kind: Notification["kind"]) => {
    switch (kind) {
      case "success":
        return <CheckmarkFilled size={20} color="var(--cds-support-success)" />;
      case "warning":
        return <WarningFilled size={20} color="var(--cds-support-warning)" />;
      case "error":
        return <ErrorFilled size={20} color="var(--cds-support-error)" />;
      case "info":
      default:
        return <InformationFilled size={20} color="var(--cds-support-info)" />;
    }
  };

  return (
    <HeaderPanel
      aria-label="Notifications Panel"
      expanded={expanded}
      onHeaderPanelFocus={onDismiss}
      className="notification-panel"
    >
      <div style={{
        height: "100%",
        width: "320px",
        position: "fixed",
        right: 0,
        top: "3rem",
        background: "var(--cds-layer-01)",
        borderLeft: "1px solid var(--cds-border-subtle-01)",
        zIndex: 9000,
        display: expanded ? "block" : "none"
      }}>
        <Switcher aria-label="Notifications List">
          <li style={{ padding: "1rem", borderBottom: "1px solid var(--cds-border-subtle-01)" }}>
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Notifications</h4>
          </li>
          {mockNotifications.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--cds-text-secondary)" }}>
              <p>No new notifications</p>
            </div>
          ) : (
            mockNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <SwitcherItem aria-label={notification.title} href="#">
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.5rem 0" }}>
                    <div style={{ marginTop: "2px" }}>{getIcon(notification.kind)}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{notification.title}</span>
                      <span style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
                        {notification.subtitle}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--cds-text-helper)", marginTop: "0.25rem" }}>
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                </SwitcherItem>
                <SwitcherDivider />
              </React.Fragment>
            ))
          )}
        </Switcher>
      </div>
    </HeaderPanel>
  );
};

export default NotificationPanel;
