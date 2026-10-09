/**
 * Station calculation helpers.
 *
 * Pure functions only — no Firebase calls, no side effects.
 * Never used to write back to /station.
 *
 * Safety limits per spec: 240 V and 32 A.
 */

export const VOLTAGE_LIMIT = 240; // V
export const CURRENT_LIMIT = 32;  // A

/**
 * Returns true if voltage is above the safety threshold.
 * The ESP32 is responsible for tripping the relay — this is display-only.
 */
export function isVoltageAbnormal(voltage) {
  return typeof voltage === 'number' && isFinite(voltage) && voltage > VOLTAGE_LIMIT;
}

/**
 * Returns true if current is above the safety threshold.
 */
export function isCurrentAbnormal(current) {
  return typeof current === 'number' && isFinite(current) && current > CURRENT_LIMIT;
}

/**
 * Derive port display state from raw port data.
 * Returns one of: 'fault' | 'charging' | 'vehiclePresent' | 'available'
 */
export function getPortState(port) {
  if (!port) return 'available';
  if (port.fault === true) return 'fault';
  if (port.charging === true) return 'charging';
  if (port.vehiclePresent === true) return 'vehiclePresent';
  return 'available';
}

/**
 * Returns a human-readable label for a port state.
 */
export function getPortStateLabel(state) {
  switch (state) {
    case 'fault': return 'Fault';
    case 'charging': return 'Charging';
    case 'vehiclePresent': return 'Vehicle Present';
    case 'available': return 'Available';
    default: return 'Unknown';
  }
}

/**
 * Count ports by state from the ports object.
 */
export function countPortsByState(ports, state) {
  if (!ports || typeof ports !== 'object') return 0;
  return Object.values(ports).filter(
    (p) => p && getPortState(p) === state
  ).length;
}

/**
 * Compute total live power across all ports in watts.
 * Only includes valid finite readings.
 */
export function computeTotalPowerWatts(ports) {
  if (!ports || typeof ports !== 'object') return 0;
  return Object.values(ports).reduce((sum, p) => {
    if (p && typeof p.power === 'number' && isFinite(p.power) && p.charging) {
      return sum + p.power;
    }
    return sum;
  }, 0);
}
