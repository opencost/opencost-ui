import { useNavigate, useLocation } from "react-router";

/**
 * Compatibility shim that maps react-router v5's useHistory() API
 * to react-router v7's useNavigate() for the legacy pages.
 */
export function useHistory() {
  const navigate = useNavigate();
  return {
    push: (path: string | { pathname?: string; search?: string }) => {
      if (typeof path === "string") {
        navigate(path);
      } else {
        const to = `${path.pathname ?? ""}${path.search ?? ""}`;
        navigate(to);
      }
    },
    replace: (path: string | { pathname?: string; search?: string }) => {
      if (typeof path === "string") {
        navigate(path, { replace: true });
      } else {
        const to = `${path.pathname ?? ""}${path.search ?? ""}`;
        navigate(to, { replace: true });
      }
    },
  };
}

export { useLocation };
