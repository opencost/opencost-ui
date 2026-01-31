import React from "react";
import { HeaderGlobalAction } from "@carbon/react";
import { Light, Asleep } from "@carbon/icons-react";
import { useColorMode } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === "g100" || mode === "g90";

  return (
    <HeaderGlobalAction
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      tooltipAlignment="bottom"
      onClick={toggleColorMode}
    >
      {isDark ? <Light size={20} /> : <Asleep size={20} />}
    </HeaderGlobalAction>
  );
};

export default ThemeToggle;
