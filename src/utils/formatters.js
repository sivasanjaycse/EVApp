/**
 * Utility formatters for display values.
 * All functions are pure — no side effects, no Firebase calls.
 */

/**
 * Format power: watts → kW, with specified decimal places.
 * Returns '—' for non-finite or missing values.
 */
export function formatPowerKW(watts, decimals = 2) {
  if (watts == null || !isFinite(watts)) return '—';
  return (watts / 1000).toFixed(decimals);
}

/**
 * Format a numeric value with a fixed number of decimal places.
 * Returns '—' for non-finite or missing values.
 */
export function formatNumber(value, decimals = 1) {
  if (value == null || !isFinite(value)) return '—';
  return Number(value).toFixed(decimals);
}

/**
 * Format uptime from milliseconds to a human-readable string.
 */
export function formatUptime(ms) {
  if (ms == null || !isFinite(ms) || ms < 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Format a timestamp to a localized time string.
 */
export function formatTime(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Format a timestamp to "X seconds/minutes ago" relative time.
 */
export function formatRelativeTime(date) {
  if (!date) return '—';
  const now = Date.now();
  const diff = Math.max(0, now - date.getTime());
  if (diff < 5000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

/**
 * Converts a temperature from Celsius to Fahrenheit.
 */
export function celsiusToFahrenheit(c) {
  if (c == null || !isFinite(c)) return null;
  return (c * 9) / 5 + 32;
}

/**
 * Format temperature with unit.
 */
export function formatTemperature(value, unit = 'C') {
  if (value == null || !isFinite(value)) return '—';
  if (unit === 'F') {
    return `${formatNumber(celsiusToFahrenheit(value), 1)}°F`;
  }
  return `${formatNumber(value, 1)}°C`;
}

/**
 * Validate a numeric reading is within an expected range.
 * Returns true if the value is a valid finite number.
 */
export function isValidReading(value, min = -Infinity, max = Infinity) {
  return value != null && isFinite(value) && value >= min && value <= max;
}
