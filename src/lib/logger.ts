/**
 * Centralized logging utility for the application.
 * Provides consistent, colorful console output for debugging user flows.
 */

const LOG_STYLES = {
  auth: 'background: #4CAF50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  action: 'background: #2196F3; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  error: 'background: #F44336; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  match: 'background: #FF4081; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  api: 'background: #9C27B0; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  notification: 'background: #FF9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  data: 'color: #666; font-style: italic;'
};

export class Logger {
  /**
   * Log authentication events (login, logout, signup)
   */
  static auth(action: string, details?: any) {
    console.log(`%c🔐 AUTH `, LOG_STYLES.auth, action);
    if (details) {
      console.log(`%c   ↳`, LOG_STYLES.data, details);
    }
  }

  /**
   * Log user actions (like, skip, preferences, etc.)
   */
  static action(action: string, details?: any) {
    console.log(`%c👆 ACTION `, LOG_STYLES.action, action);
    if (details) {
      console.log(`%c   ↳`, LOG_STYLES.data, details);
    }
  }

  /**
   * Log errors
   */
  static error(context: string, error: any) {
    console.log(`%c❌ ERROR `, LOG_STYLES.error, context);
    console.error('   ↳', error);
  }

  /**
   * Log match/notification events
   */
  static match(event: string, details?: any) {
    console.log(`%c💕 MATCH `, LOG_STYLES.match, event);
    if (details) {
      console.log(`%c   ↳`, LOG_STYLES.data, details);
    }
  }

  /**
   * Log API calls
   */
  static api(method: string, endpoint: string, details?: any) {
    console.log(`%c🌐 API `, LOG_STYLES.api, `${method} ${endpoint}`);
    if (details) {
      console.log(`%c   ↳`, LOG_STYLES.data, details);
    }
  }

  /**
   * Log real-time notifications
   */
  static notification(type: string, message: string, details?: any) {
    console.log(`%c🔔 NOTIFICATION `, LOG_STYLES.notification, `${type}: ${message}`);
    if (details) {
      console.log(`%c   ↳`, LOG_STYLES.data, details);
    }
  }

  /**
   * Log group start (for collapsible sections)
   */
  static groupStart(label: string) {
    console.group(`📦 ${label}`);
  }

  /**
   * Log group end
   */
  static groupEnd() {
    console.groupEnd();
  }

  /**
   * Log a separator line
   */
  static separator() {
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ddd;');
  }
}
