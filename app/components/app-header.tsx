import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
} from "@carbon/react";
import { Asleep, Light } from "@carbon/icons-react";
import { useAppTheme } from "~/components/theme-context";

interface AppHeaderProps {
  children?: React.ReactNode;
}

export default function AppHeader({ children }: AppHeaderProps) {
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === "g100";

  return (
    <Header aria-label="OpenCost Platform">
      <HeaderName href="/" prefix="">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="OpenCost" className="h-6" />
      </HeaderName>
      <HeaderGlobalBar>
        {children}
        <HeaderGlobalAction
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-pressed={isDark}
          tooltipAlignment="end"
          onClick={toggleTheme}
        >
          {isDark ? <Light size={20} /> : <Asleep size={20} />}
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>
  );
}
