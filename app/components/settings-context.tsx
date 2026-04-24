import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "opencost-settings-v1";

interface SettingsContextValue {
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface StoredSettings {
  defaultCurrency?: string;
}

function loadFromStorage(): StoredSettings {
  try {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored) as StoredSettings;
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch {
  }
  return {};
}

function saveToStorage(settings: StoredSettings) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch {
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [defaultCurrency, setDefaultCurrencyState] = useState("USD");

  useEffect(() => {
    const stored = loadFromStorage();
    if (typeof stored.defaultCurrency === "string" && stored.defaultCurrency.length > 0) {
      setDefaultCurrencyState(stored.defaultCurrency);
    }
  }, []);

  const setDefaultCurrency = (currency: string) => {
    setDefaultCurrencyState(currency);
    saveToStorage({ defaultCurrency: currency });
  };

  return (
    <SettingsContext.Provider value={{ defaultCurrency, setDefaultCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
