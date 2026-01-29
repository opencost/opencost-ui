import React from "react";
import { useTheme } from "../context/ThemeContext";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const ThemeToggle = () => {
    const { isDark, toggleTheme, colors } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.backgroundSecondary,
                color: isDark ? "#fbbf24" : "#6b7280",
                cursor: "pointer",
                transition: "all 0.2s ease",
                padding: 0,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
                e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                e.currentTarget.style.transform = "scale(1)";
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <LightModeIcon fontSize="small" />
            ) : (
                <DarkModeIcon fontSize="small" />
            )}
        </button>
    );
};

export default ThemeToggle;
