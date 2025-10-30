/**
 * Debug logging utility for CineMatch
 * 
 * All debug logs are guarded by window.__cineDebug flag.
 * Enable debugging by running in browser console:
 *   window.__cineDebug = true
 * 
 * Disable with:
 *   window.__cineDebug = false
 */

// Extend Window interface to include __cineDebug flag
declare global {
  interface Window {
    __cineDebug?: boolean;
  }
}

/**
 * Log levels for debug output
 */
export type DebugLevel = 'info' | 'warn' | 'error' | 'success' | 'transition';

/**
 * Debug logger that only logs when window.__cineDebug is enabled
 */
export function debug(
  module: string,
  level: DebugLevel,
  message: string,
  data?: unknown
): void {
  if (!window.__cineDebug) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${module}]`;

  switch (level) {
    case 'info':
      console.log(`${prefix} ℹ️ ${message}`, data ?? '');
      break;
    case 'warn':
      console.warn(`${prefix} ⚠️ ${message}`, data ?? '');
      break;
    case 'error':
      console.error(`${prefix} ❌ ${message}`, data ?? '');
      break;
    case 'success':
      console.log(`${prefix} ✅ ${message}`, data ?? '');
      break;
    case 'transition':
      console.log(`${prefix} 🔄 ${message}`, data ?? '');
      break;
  }
}

/**
 * Specialized debug loggers for common scenarios
 */
export const debugFlow = {
  /**
   * Log navigation events
   */
  navigate: (from: string, to: string, reason?: string) => {
    debug(
      'Navigation',
      'transition',
      `${from} → ${to}`,
      reason ? { reason } : undefined
    );
  },

  /**
   * Log API calls
   */
  apiCall: (method: string, endpoint: string, payload?: unknown) => {
    debug('API', 'info', `${method} ${endpoint}`, payload);
  },

  /**
   * Log API responses
   */
  apiResponse: (endpoint: string, status: number, data?: unknown) => {
    const level = status >= 200 && status < 300 ? 'success' : 'error';
    debug('API', level, `${endpoint} → ${status}`, data);
  },

  /**
   * Log state transitions
   */
  stateChange: (component: string, from: string, to: string, trigger?: string) => {
    debug(
      component,
      'transition',
      `State: ${from} → ${to}`,
      trigger ? { trigger } : undefined
    );
  },

  /**
   * Log SignalR events
   */
  signalREvent: (event: string, data?: unknown) => {
    debug('SignalR', 'info', `Event received: ${event}`, data);
  },

  /**
   * Log data transformations
   */
  transform: (from: string, to: string, data?: unknown) => {
    debug('Adapter', 'transition', `${from} → ${to}`, data);
  },

  /**
   * Log user actions
   */
  userAction: (component: string, action: string, data?: unknown) => {
    debug(component, 'info', `User action: ${action}`, data);
  },
};

/**
 * Initialize debug mode
 * Call this in main.tsx to set up debug logging
 */
export function initDebugMode(): void {
  if (window.__cineDebug) {
    console.log(
      '%c🎬 CineMatch Debug Mode Enabled',
      'background: #8b5cf6; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;'
    );
    console.log(
      '%cDebug logs will appear below. Disable with: window.__cineDebug = false',
      'color: #8b5cf6; font-style: italic;'
    );
  }
}
