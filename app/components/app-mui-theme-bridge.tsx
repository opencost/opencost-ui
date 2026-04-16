import { useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";
import { useAppTheme } from "~/components/theme-context";

export default function AppMuiThemeBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useAppTheme();

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme === "g100" ? "dark" : "light",
        },
      }),
    [theme],
  );

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
}
