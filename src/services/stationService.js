/**
 * Station data service — reads ESP32 telemetry from Firebase.
 *
 * READ-ONLY. No PUT/PATCH/DELETE ever touches /station.
 * The ESP32 firmware is the sole owner of /station.
 *
 * Firebase paths used (read-only):
 *   /station/station.json  — summary (status, occupiedPorts, temp, humidity…)
 *   /station/ports.json    — per-port telemetry (voltage, current, power…)
 *   /station/device.json   — device info (uptimeMs, wifiConnected)
 */

import { firebaseGet } from './firebaseRest';

/**
 * Fetch the complete /station subtree in parallel.
 * Returns { stationInfo, ports, device } or throws.
 */
export async function fetchStationData() {
  const [stationInfo, ports, device] = await Promise.all([
    firebaseGet('/station/station.json'),
    firebaseGet('/station/ports.json'),
    firebaseGet('/station/device.json'),
  ]);
  return { stationInfo, ports, device };
}

/**
 * Returns the number of ports currently charging.
 * Safe against null/undefined port data.
 */
export function countChargingPorts(ports) {
  if (!ports || typeof ports !== 'object') return 0;
  return Object.values(ports).filter((p) => p && p.charging === true).length;
}

/**
 * Returns total live power in watts across all ports.
 * Does NOT represent lifetime energy — only instantaneous snapshot.
 */
export function totalLivePowerWatts(ports) {
  if (!ports || typeof ports !== 'object') return 0;
  return Object.values(ports).reduce((sum, p) => {
    const w = p && typeof p.power === 'number' && isFinite(p.power) ? p.power : 0;
    return sum + w;
  }, 0);
}
