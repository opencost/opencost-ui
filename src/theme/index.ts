import { createTheme } from "@mui/material/styles";

const headingFont = '"Lexend", "Helvetica", "Arial", sans-serif';
const bodyFont = '"IBM Plex Sans", "Helvetica Neue", "Arial", sans-serif';

const commonSettings = {
  typography: {
    fontFamily: bodyFont,
    h1: {
      fontFamily: headingFont,
      fontSize: "3rem",
      fontWeight: 500,
    },
    h2: {
      fontFamily: headingFont,
      fontSize: "2.5rem",
      fontWeight: 500,
    },
    h3: {
      fontFamily: headingFont,
      fontSize: "2rem",
      fontWeight: 500,
    },
    h4: {
      fontFamily: headingFont,
      fontSize: "1.5rem",
      fontWeight: 500,
    },
    h5: {
      fontFamily: headingFont,
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    h6: {
      fontFamily: headingFont,
      fontSize: "1rem",
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: headingFont,
      fontSize: "1rem",
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: headingFont,
      fontSize: "0.875rem",
      fontWeight: 500,
    },
    body1: {
      fontFamily: bodyFont,
      fontSize: "1rem",
    },
    body2: {
      fontFamily: bodyFont,
      fontSize: "0.875rem",
    },
    button: {
      fontFamily: bodyFont,
      textTransform: "none" as const,
    },
    caption: {
      fontFamily: bodyFont,
      fontSize: "0.75rem",
    },
    overline: {
      fontFamily: bodyFont,
      fontSize: "0.75rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          fontFamily: bodyFont,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: bodyFont,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: bodyFont,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: bodyFont,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: bodyFont,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: bodyFont,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: bodyFont,
          scrollbarColor: "#999 transparent",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "transparent",
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#999",
            minHeight: 24,
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus":
            {
              backgroundColor: "#777",
            },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: "light",
    primary: {
      main: "#0f62fe",
      light: "#4589ff",
      dark: "#0043ce",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6f6f6f",
      light: "#8d8d8d",
      dark: "#525252",
    },
    background: {
      default: "#f4f4f4",
      paper: "#ffffff",
    },
    text: {
      primary: "#161616",
      secondary: "#525252",
    },
    divider: "#e0e0e0",
    error: {
      main: "#da1e28",
      light: "#fa4d56",
      dark: "#a2191f",
    },
    warning: {
      main: "#f1c21b",
      light: "#fddc69",
      dark: "#8e6a00",
    },
    success: {
      main: "#24a148",
      light: "#42be65",
      dark: "#198038",
    },
    info: {
      main: "#0043ce",
      light: "#4589ff",
      dark: "#002d9c",
    },
    action: {
      hover: "rgba(0, 0, 0, 0.04)",
      selected: "rgba(0, 0, 0, 0.08)",
    },
  },
});

export const darkTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: "dark",
    primary: {
      main: "#78a9ff",
      light: "#a6c8ff",
      dark: "#4589ff",
      contrastText: "#161616",
    },
    secondary: {
      main: "#8d8d8d",
      light: "#a8a8a8",
      dark: "#6f6f6f",
    },
    background: {
      default: "#161616",
      paper: "#262626",
    },
    text: {
      primary: "#f4f4f4",
      secondary: "#c6c6c6",
    },
    divider: "rgba(244, 244, 244, 0.15)",
    error: {
      main: "#ff8389",
      light: "#ffb3b8",
      dark: "#fa4d56",
    },
    warning: {
      main: "#f1c21b",
      light: "#fddc69",
      dark: "#d2a106",
    },
    success: {
      main: "#42be65",
      light: "#6fdc8c",
      dark: "#24a148",
    },
    info: {
      main: "#4589ff",
      light: "#78a9ff",
      dark: "#0f62fe",
    },
    action: {
      hover: "rgba(244, 244, 244, 0.08)",
      selected: "rgba(244, 244, 244, 0.16)",
    },
  },
});
