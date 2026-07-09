import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeName = "white" | "g100";

export const THEME_STORAGE_KEY = "opencost-theme";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): ThemeName | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw === "white" || raw === "g100" ? raw : null;
  } catch {
    return null;
  }
}

function readPreferredTheme(): ThemeName {
  return "white";
}

function applyThemeToDocument(theme: ThemeName) {
  if (typeof document === "undefined") return;
  
  // 1. Apply to html (documentElement)
  const root = document.documentElement;
  root.setAttribute("data-carbon-theme", theme);
  root.classList.remove("cds--white", "cds--g100");
  root.classList.add(theme === "g100" ? "cds--g100" : "cds--white");
  root.style.colorScheme = theme === "g100" ? "dark" : "light";

  // 2. Apply to body
  const body = document.body;
  if (body) {
    body.setAttribute("data-carbon-theme", theme);
    body.classList.remove("cds--white", "cds--g100");
    body.classList.add(theme === "g100" ? "cds--g100" : "cds--white");
    body.style.colorScheme = theme === "g100" ? "dark" : "light";
  }
}

function readDocumentTheme(): ThemeName | null {
  if (typeof document === "undefined") return null;
  const attr = document.documentElement.getAttribute("data-carbon-theme");
  return attr === "white" || attr === "g100" ? attr : null;
}

function resolveInitialTheme(): ThemeName {
  return (
    readDocumentTheme() ?? readStoredTheme() ?? readPreferredTheme() ?? "white"
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(resolveInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);


  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "g100" ? "white" : "g100");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return ctx;
}
