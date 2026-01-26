import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem("opencost-theme");
        return saved ? saved === "dark" : true; // Default to dark
    });

    useEffect(() => {
        localStorage.setItem("opencost-theme", isDark ? "dark" : "light");
        document.body.setAttribute("data-theme", isDark ? "dark" : "light");
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const theme = {
        isDark,
        toggleTheme,
        colors: isDark
            ? {
                background: "#0f172a",
                backgroundSecondary: "#1e293b",
                backgroundTertiary: "#334155",
                border: "#374151",
                text: "#e5e7eb",
                textSecondary: "#9ca3af",
                textMuted: "#6b7280",
                accent: "#00d4aa",
                accentSecondary: "#8b5cf6",
            }
            : {
                background: "#f8fafc",
                backgroundSecondary: "#ffffff",
                backgroundTertiary: "#f1f5f9",
                border: "#e2e8f0",
                text: "#1e293b",
                textSecondary: "#64748b",
                textMuted: "#94a3b8",
                accent: "#0d9488",
                accentSecondary: "#7c3aed",
            },
    };

    return (
        <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    );
};

export default ThemeContext;
