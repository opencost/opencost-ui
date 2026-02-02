import { useEffect } from "react";

type EventCallback = (detail?: any) => void;

class GlobalEventBus {
  private listeners: Record<string, EventCallback[]> = {};

  fire(event: string, detail?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(detail));
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }
}

export const globalEventBus = new GlobalEventBus();

export const useGlobalEvent = (event: string, callback: EventCallback) => {
  useEffect(() => {
    return globalEventBus.on(event, callback);
  }, [event, callback]);
};
