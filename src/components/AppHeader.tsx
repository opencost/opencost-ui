import { useState, useMemo } from "react";
import {
  Header,
  HeaderMenuButton,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
} from "@carbon/react";
import { Notification, Keyboard } from "@carbon/icons-react";
import { useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import { globalEventBus } from "../services/eventBus";
import NotificationPanel from "./NotificationPanel";
import { useColorMode } from "@/contexts/ThemeContext";

const logo = new URL("../images/logo.png", import.meta.url).href;

const AppHeader = ({ isSideNavExpanded, onToggleSideNav }) => {
  const navigate = useNavigate();
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { toggleColorMode } = useColorMode();

  useKeyboardShortcuts(
    useMemo(
      () => ({
        "/": () => setIsShortcutModalOpen(true),
        r: () => globalEventBus.fire("refresh"),
        "Shift+A": () => navigate("/allocation"),
        "Shift+S": () => navigate("/assets"),
        "Shift+C": () => navigate("/cloud"),
        "Shift+E": () => navigate("/external-costs"),
        "Ctrl+M": () => toggleColorMode(),
        "Ctrl+I": () => setIsNotificationOpen((prev) => !prev),
      }),
      [navigate, toggleColorMode]
    )
  );

  return (
    <>
      <Header aria-label="OpenCost">
        <HeaderMenuButton
          aria-label="Open menu"
          isActive={isSideNavExpanded}
          onClick={onToggleSideNav}
        />
        <HeaderName
          href="/"
          prefix=""
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <img
            src={logo}
            alt="OpenCost"
            className="app-header-logo"
            style={{ height: "28px" }}
          />
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Keyboard Shortcuts"
            tooltipAlignment="end"
            onClick={() => setIsShortcutModalOpen(true)}
          >
            <Keyboard size={20} />
          </HeaderGlobalAction>
          <ThemeToggle />
          <HeaderGlobalAction
            aria-label="Notifications"
            tooltipAlignment="end"
            isActive={isNotificationOpen}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Notification size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
        <NotificationPanel
          expanded={isNotificationOpen}
          onDismiss={() => setIsNotificationOpen(false)}
        />
      </Header>
      <KeyboardShortcutsModal
        open={isShortcutModalOpen}
        onRequestClose={() => setIsShortcutModalOpen(false)}
      />
    </>
  );
};

export default AppHeader;
