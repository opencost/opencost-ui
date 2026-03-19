const logLevels = ["error", "warn", "log", "info", "debug", "trace"] as const;

export type LogLevel = (typeof logLevels)[number];

const defaultLogLevel: LogLevel = "log";

export interface LoggerType extends Console {
  _logLevel: LogLevel;
  getLogLevel(): LogLevel;
  setLogLevel(level: LogLevel): void;
}

export function createLogger(level: LogLevel = defaultLogLevel): LoggerType {
  let initialLevel: LogLevel = level;
  if (!logLevels.includes(level)) {
    console.warn(
      `Attempting to initialize a logger with an invalid log level: ${level}. Valid levels are: ${logLevels.join(", ")}.`,
    );
    console.warn(`Initializing logger with default log level: ${defaultLogLevel}.`);
    initialLevel = defaultLogLevel;
  }

  const handler: ProxyHandler<Console & { _logLevel: LogLevel; getLogLevel(): LogLevel }> = {
    get(target, prop, receiver) {
      const currentLevel = target.getLogLevel();
      if (
        typeof prop === "string" &&
        logLevels.includes(prop as LogLevel) &&
        logLevels.includes(currentLevel) &&
        logLevels.indexOf(prop as LogLevel) > logLevels.indexOf(currentLevel)
      ) {
        return () => {};
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop, receiver);
    },
  };

  const base: any = console;
  const logger = new Proxy(base, handler) as LoggerType;
  logger._logLevel = initialLevel;
  logger.getLogLevel = function () {
    return this._logLevel;
  };
  logger.setLogLevel = function (logLevel: LogLevel) {
    if (logLevels.includes(logLevel)) {
      this._logLevel = logLevel;
    } else {
      console.warn(`Attempting to set unrecognized log level: ${logLevel}. Skipping.`);
      console.warn(`Valid log levels are ${logLevels.join(", ")}`);
    }
  };

  return logger;
}

export const Logger: LoggerType = createLogger();

