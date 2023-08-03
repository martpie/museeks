import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export default logger;

/**
 * Custom implementation of timers helpers for benchmarking
 */
const TIMERS: Record<string, number> = {};

function time(id: string) {
  if (TIMERS[id] !== undefined) {
    logger.warn(`Time "${id}" is already in use, ignoring`);
  } else {
    TIMERS[id] = Date.now();
  }
}

function timeEnd(id: string) {
  if (TIMERS[id] === undefined) {
    logger.warn(`Time "${id}" is not initialized, ignoring`);
  } else {
    const start = TIMERS[id];
    const now = Date.now();
    delete TIMERS[id];
    logger.info(`${id}: ${now - start}ms`);
  }
}

export const loggerExtras = {
  time,
  timeEnd,
};
