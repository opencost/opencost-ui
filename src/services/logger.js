/**
 * The logger defined in this module should be preferred over `console` methods whenever possible.
 */

// Define basic log levels.
// The `console` object supports other methods, but we'll only give special attention to these for now.
const logLevels = [
    'error',
    'warn',
    'log',
    'info',
    'debug',
    'trace',
];

const defaultLogLevel = 'log';

/**
 * Create and return a new Logger object.
 * 
 * The Logger behaves just like the `console` global object, with the addition of an internal "log level" which can be set.
 * Logging methods more verbose than the set level will become no-op functions.
 * 
 * For example, calling `Logger.trace("message")` when the `Logger`'s `_logLevel` prop is set to `"error"` will result in the
 * message being dropped, with no log occurring.
 * 
 * In the future, we may expose this through a build-time or run-time variable, or set log levels automatically
 * based on whether we are in test, dev, or prod environments.
 */
function createLogger(level = defaultLogLevel) {
    let logLevel = level;
    if (!logLevels.includes(level)) {
        console.warn(`Attempting to initialize a logger with an invalid log level: ${level}. Valid levels are: ${logLevels.join(', ')}.`);
        console.warn(`Initializing logger with default log level: ${defaultLogLevel}.`);
        logLevel = defaultLogLevel;
    }
    const handler = {
        get(target, prop, receiver) {
            const logLevel = target.getLogLevel();
            if (
                logLevels.includes(prop) &&
                logLevels.includes(logLevel) &&
                logLevels.indexOf(prop) > logLevels.indexOf(logLevel)
            ) {
                return () => {};
            }
            return Reflect.get(...arguments);
        }
    };
    const logger = new Proxy(console, handler);
    logger._logLevel = logLevel;
    logger.getLogLevel = function() { return this._logLevel; }
    logger.setLogLevel = function(logLevel) { this._logLevel = logLevel; }
    return logger;
}

// Define and expose a basic logger with default behavior.
const Logger = createLogger();
export { Logger, createLogger };