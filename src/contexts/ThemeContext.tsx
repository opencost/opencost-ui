import { createContext, useContext, useState, useEffect, useMemo } from "react";

const ColorModeContext = createContext({
  toggleColorMode: () => { },
  mode: "white",
});

export const useColorMode = () => useContext(ColorModeContext);

// White theme (light) - Carbon Design System v11
const whiteTheme = {
  "--cds-background": "#ffffff",
  "--cds-background-hover": "#e8e8e8",
  "--cds-background-active": "#c6c6c6",
  "--cds-background-selected": "#e0e0e0",
  "--cds-layer-01": "#f4f4f4",
  "--cds-layer-02": "#ffffff",
  "--cds-layer-03": "#f4f4f4",
  "--cds-layer-hover-01": "#e8e8e8",
  "--cds-layer-hover-02": "#e8e8e8",
  "--cds-layer-hover-03": "#e8e8e8",
  "--cds-layer-active-01": "#c6c6c6",
  "--cds-layer-active-02": "#c6c6c6",
  "--cds-layer-active-03": "#c6c6c6",
  "--cds-layer-selected-01": "#e0e0e0",
  "--cds-layer-selected-02": "#e0e0e0",
  "--cds-layer-selected-03": "#e0e0e0",
  "--cds-layer-selected-hover-01": "#d1d1d1",
  "--cds-layer-selected-hover-02": "#d1d1d1",
  "--cds-layer-selected-hover-03": "#d1d1d1",
  "--cds-field-01": "#f4f4f4",
  "--cds-field-02": "#ffffff",
  "--cds-field-03": "#f4f4f4",
  "--cds-field-hover-01": "#e8e8e8",
  "--cds-field-hover-02": "#e8e8e8",
  "--cds-field-hover-03": "#e8e8e8",
  "--cds-border-subtle-00": "#e0e0e0",
  "--cds-border-subtle-01": "#e0e0e0",
  "--cds-border-subtle-02": "#c6c6c6",
  "--cds-border-subtle-03": "#e0e0e0",
  "--cds-border-subtle-selected-01": "#c6c6c6",
  "--cds-border-subtle-selected-02": "#a8a8a8",
  "--cds-border-subtle-selected-03": "#c6c6c6",
  "--cds-border-strong-01": "#8d8d8d",
  "--cds-border-strong-02": "#8d8d8d",
  "--cds-border-strong-03": "#8d8d8d",
  "--cds-border-tile-01": "#c6c6c6",
  "--cds-border-tile-02": "#e0e0e0",
  "--cds-border-tile-03": "#c6c6c6",
  "--cds-border-inverse": "#161616",
  "--cds-border-interactive": "#0066ff",
  "--cds-border-disabled": "rgba(22, 22, 22, 0.25)",
  "--cds-text-primary": "#161616",
  "--cds-text-secondary": "#525252",
  "--cds-text-placeholder": "#a8a8a8",
  "--cds-text-helper": "#6f6f6f",
  "--cds-text-error": "#da1e28",
  "--cds-text-inverse": "#ffffff",
  "--cds-text-on-color": "#ffffff",
  "--cds-text-on-color-disabled": "rgba(255, 255, 255, 0.25)",
  "--cds-text-disabled": "rgba(22, 22, 22, 0.25)",
  "--cds-link-primary": "#0066ff",
  "--cds-link-secondary": "#0043ce",
  "--cds-link-inverse": "#78a9ff",
  "--cds-link-visited": "#9900ff",
  "--cds-icon-primary": "#161616",
  "--cds-icon-secondary": "#525252",
  "--cds-icon-on-color": "#ffffff",
  "--cds-icon-on-color-disabled": "rgba(255, 255, 255, 0.25)",
  "--cds-icon-inverse": "#ffffff",
  "--cds-icon-disabled": "rgba(22, 22, 22, 0.25)",
  "--cds-support-error": "#da1e28",
  "--cds-support-success": "#24a148",
  "--cds-support-warning": "#f1c21b",
  "--cds-support-info": "#0043ce",
  "--cds-support-error-inverse": "#fa4d56",
  "--cds-support-success-inverse": "#42be65",
  "--cds-support-warning-inverse": "#f1c21b",
  "--cds-support-info-inverse": "#4589ff",
  "--cds-button-primary": "#0066ff",
  "--cds-button-primary-hover": "#0353e9",
  "--cds-button-primary-active": "#002d9c",
  "--cds-button-secondary": "#393939",
  "--cds-button-secondary-hover": "#4c4c4c",
  "--cds-button-secondary-active": "#6f6f6f",
  "--cds-button-tertiary": "#0066ff",
  "--cds-button-tertiary-hover": "#0353e9",
  "--cds-button-tertiary-active": "#002d9c",
  "--cds-button-danger": "#da1e28",
  "--cds-button-danger-hover": "#b81921",
  "--cds-button-danger-active": "#750e13",
  "--cds-button-separator": "#e0e0e0",
  "--cds-button-disabled": "#c6c6c6",
  "--cds-focus": "#0066ff",
  "--cds-focus-inset": "#ffffff",
  "--cds-focus-inverse": "#ffffff",
  "--cds-skeleton-background": "#e8e8e8",
  "--cds-skeleton-element": "#c6c6c6",
  "--cds-toggle-off": "#8d8d8d",
  "--cds-overlay": "rgba(22, 22, 22, 0.5)",
};

// G100 theme (dark) - Carbon Design System v11
const g100Theme = {
  "--cds-background": "#161616",
  "--cds-background-hover": "#292929",
  "--cds-background-active": "#393939",
  "--cds-background-selected": "#292929",
  "--cds-layer-01": "#262626",
  "--cds-layer-02": "#393939",
  "--cds-layer-03": "#525252",
  "--cds-layer-hover-01": "#333333",
  "--cds-layer-hover-02": "#474747",
  "--cds-layer-hover-03": "#636363",
  "--cds-layer-active-01": "#525252",
  "--cds-layer-active-02": "#6f6f6f",
  "--cds-layer-active-03": "#8d8d8d",
  "--cds-layer-selected-01": "#525252",
  "--cds-layer-selected-02": "#6f6f6f",
  "--cds-layer-selected-03": "#8d8d8d",
  "--cds-layer-selected-hover-01": "#636363",
  "--cds-layer-selected-hover-02": "#5e5e5e",
  "--cds-layer-selected-hover-03": "#8d8d8d",
  "--cds-field-01": "#262626",
  "--cds-field-02": "#393939",
  "--cds-field-03": "#525252",
  "--cds-field-hover-01": "#333333",
  "--cds-field-hover-02": "#474747",
  "--cds-field-hover-03": "#636363",
  "--cds-border-subtle-00": "#393939",
  "--cds-border-subtle-01": "#393939",
  "--cds-border-subtle-02": "#525252",
  "--cds-border-subtle-03": "#6f6f6f",
  "--cds-border-subtle-selected-01": "#525252",
  "--cds-border-subtle-selected-02": "#6f6f6f",
  "--cds-border-subtle-selected-03": "#8d8d8d",
  "--cds-border-strong-01": "#6f6f6f",
  "--cds-border-strong-02": "#8d8d8d",
  "--cds-border-strong-03": "#a8a8a8",
  "--cds-border-tile-01": "#525252",
  "--cds-border-tile-02": "#6f6f6f",
  "--cds-border-tile-03": "#8d8d8d",
  "--cds-border-inverse": "#f4f4f4",
  "--cds-border-interactive": "#4589ff",
  "--cds-border-disabled": "rgba(244, 244, 244, 0.25)",
  "--cds-text-primary": "#f4f4f4",
  "--cds-text-secondary": "#c6c6c6",
  "--cds-text-placeholder": "#6f6f6f",
  "--cds-text-helper": "#a8a8a8",
  "--cds-text-error": "#ff8389",
  "--cds-text-inverse": "#161616",
  "--cds-text-on-color": "#ffffff",
  "--cds-text-on-color-disabled": "rgba(255, 255, 255, 0.25)",
  "--cds-text-disabled": "rgba(244, 244, 244, 0.25)",
  "--cds-link-primary": "#78a9ff",
  "--cds-link-secondary": "#a6c8ff",
  "--cds-link-inverse": "#0066ff",
  "--cds-link-visited": "#be95ff",
  "--cds-icon-primary": "#f4f4f4",
  "--cds-icon-secondary": "#c6c6c6",
  "--cds-icon-on-color": "#ffffff",
  "--cds-icon-on-color-disabled": "rgba(255, 255, 255, 0.25)",
  "--cds-icon-inverse": "#161616",
  "--cds-icon-disabled": "rgba(244, 244, 244, 0.25)",
  "--cds-support-error": "#ff8389",
  "--cds-support-success": "#42be65",
  "--cds-support-warning": "#f1c21b",
  "--cds-support-info": "#4589ff",
  "--cds-support-error-inverse": "#da1e28",
  "--cds-support-success-inverse": "#24a148",
  "--cds-support-warning-inverse": "#f1c21b",
  "--cds-support-info-inverse": "#0066ff",
  "--cds-button-primary": "#0066ff",
  "--cds-button-primary-hover": "#0353e9",
  "--cds-button-primary-active": "#002d9c",
  "--cds-button-secondary": "#6f6f6f",
  "--cds-button-secondary-hover": "#5e5e5e",
  "--cds-button-secondary-active": "#8d8d8d",
  "--cds-button-tertiary": "#78a9ff",
  "--cds-button-tertiary-hover": "#a6c8ff",
  "--cds-button-tertiary-active": "#ffffff",
  "--cds-button-danger": "#da1e28",
  "--cds-button-danger-hover": "#b81921",
  "--cds-button-danger-active": "#750e13",
  "--cds-button-separator": "#6f6f6f",
  "--cds-button-disabled": "#525252",
  "--cds-focus": "#ffffff",
  "--cds-focus-inset": "#161616",
  "--cds-focus-inverse": "#0066ff",
  "--cds-skeleton-background": "#353535",
  "--cds-skeleton-element": "#525252",
  "--cds-toggle-off": "#6f6f6f",
  "--cds-overlay": "rgba(0, 0, 0, 0.65)",
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("white");

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) {
      setMode(savedMode);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setMode("g100");
    }
  }, []);

  useEffect(() => {
    const themeVars = mode === "white" ? whiteTheme : g100Theme;

    // Apply all CSS variables
    Object.entries(themeVars).forEach(([prop, value]) => {
      document.documentElement.style.setProperty(prop, value);
    });

    document.documentElement.setAttribute("data-carbon-theme", mode);
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "white" ? "g100" : "white"));
      },
      mode,
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      {children}
    </ColorModeContext.Provider>
  );
};
