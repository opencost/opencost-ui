import { useEffect, useCallback } from "react";

type KeyHandler = () => void;

interface KeyboardShortcuts {
  [key: string]: KeyHandler;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      let key = event.key;

      if (event.shiftKey && key.length === 1 && key.toUpperCase() !== key.toLowerCase()) {
        key = `Shift+${key.toUpperCase()}`;

      } else if (key === "/") {
        key = "/";
      } else {
        key = key.toLowerCase();
      }

      const handler = shortcuts[key] || shortcuts[event.key];

      if (handler) {
        event.preventDefault();
        handler();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
