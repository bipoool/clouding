/**
 * Logger utility that only logs in development mode
 * Prevents sensitive information from being logged in production
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production'

  log(...args: any[]) {
    if (this.isDevelopment) {
      console.log(...args)
    }
  }

  warn(...args: any[]) {
    if (this.isDevelopment) {
      console.warn(...args)
    }
  }

  error(...args: any[]) {
    if (this.isDevelopment) {
      console.error(...args)
    }
  }

  info(...args: any[]) {
    if (this.isDevelopment) {
      console.info(...args)
    }
  }

  debug(...args: any[]) {
    if (this.isDevelopment) {
      console.debug(...args)
    }
  }
}

// Export a singleton instance
export const logger = new Logger() 