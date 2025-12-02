export class AppLogger {
  private static formatMessage(level: string, message: string, data?: unknown) {
    const time = new Date().toISOString();

    return {
      time,
      level,
      message,
      ...(data !== undefined ? { data } : {}),
    };
  }

  static info(message: string, data?: unknown) {
    console.log(this.formatMessage('INFO', message, data));
  }

  static warn(message: string, data?: unknown) {
    console.warn(this.formatMessage('WARN', message, data));
  }

  static error(message: string, data?: unknown) {
    console.error(this.formatMessage('ERROR', message, data));
  }

  static debug(message: string, data?: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }
}
