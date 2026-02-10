import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { usePrefersDarkScheme } from "@carbon/react";

const STORAGE_KEY = "opencost-theme";
const LIGHT = "white";
const DARK = "g90";

const ThemeContext = createContext({
  theme: LIGHT,
  isDark: false,
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const prefersDark = usePrefersDarkScheme();

  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === LIGHT || stored === DARK) return stored;
    } catch (e) {
      // localStorage unavailable
    }
    return prefersDark ? DARK : LIGHT;
  });

  const isDark = theme === DARK;

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === LIGHT ? DARK : LIGHT;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        // localStorage write failure is non-critical
      }
      return next;
    });
  }, []);

  // Sync body theme attribute since <body> is outside the Carbon Theme wrapper
  useEffect(() => {
    document.body.setAttribute("data-carbon-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, isDark, toggleTheme }),
    [theme, isDark, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
