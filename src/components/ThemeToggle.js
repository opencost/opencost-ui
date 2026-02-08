import { useThemeMode } from "../context/ThemeContext";
import { IconButton } from "@carbon/react";
import { Light, Asleep } from "@carbon/icons-react";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <IconButton
      kind="ghost"
      size="sm"
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      align="right"
      style={{
        color: isDark ? "#d12771" : "#ee538b",
      }}
    >
      {isDark ? <Light size={20} /> : <Asleep size={20} />}
    </IconButton>
  );
};

export default ThemeToggle;
