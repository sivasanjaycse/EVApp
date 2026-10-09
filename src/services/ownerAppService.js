/**
 * Owner-app data service.
 *
 * Manages the /ownerApp Firebase object — completely separate from /station.
 * Uses targeted PATCH requests to avoid overwriting sibling keys.
 *
 * Firebase paths used:
 *   /ownerApp.json              — read full owner-app state
 *   /ownerApp/preferences.json  — PATCH preferences only
 *   /ownerApp/appMetadata.json  — PATCH app metadata only
 *
 * The /station path is NEVER touched by this service.
 */

import { firebaseGet, firebasePatch } from './firebaseRest';

/** Default owner-app structure — used only to fill in missing keys, never to overwrite. */
const DEFAULTS = {
  schemaVersion: 1,
  preferences: {
    theme: 'green-white',
    temperatureUnit: 'C',
    powerUnit: 'kW',
  },
  analytics: {
    totalSessions: null,
    totalEnergyKWh: null,
    vehiclesServed: null,
    lastUpdated: null,
  },
  appMetadata: {
    lastOpenedAt: null,
    schemaVersion: 1,
  },
};

/**
 * Read the /ownerApp object. Returns merged-with-defaults object.
 * Does NOT write on read — initialization is a separate step.
 */
export async function fetchOwnerAppData() {
  try {
    const data = await firebaseGet('/ownerApp.json');
    // Merge deeply so missing keys fall back to defaults without overwriting existing values
    return mergeWithDefaults(data, DEFAULTS);
  } catch {
    // If the node doesn't exist yet or network fails, return defaults
    return { ...DEFAULTS };
  }
}

/**
 * Initialize missing /ownerApp fields on first app open.
 * Uses PATCH so it never overwrites existing data.
 */
export async function initOwnerAppIfNeeded() {
  try {
    const existing = await firebaseGet('/ownerApp.json');
    const patches = {};

    // Only write fields that do not already exist
    if (!existing || existing.schemaVersion == null) {
      patches.schemaVersion = DEFAULTS.schemaVersion;
    }
    if (!existing?.preferences) {
      patches.preferences = DEFAULTS.preferences;
    }
    if (!existing?.appMetadata) {
      patches.appMetadata = {
        ...DEFAULTS.appMetadata,
        lastOpenedAt: new Date().toISOString(),
      };
    } else if (!existing.appMetadata?.lastOpenedAt) {
      // Only update lastOpenedAt if it doesn't exist
      await firebasePatch('/ownerApp/appMetadata.json', {
        lastOpenedAt: new Date().toISOString(),
      });
    }

    if (Object.keys(patches).length > 0) {
      await firebasePatch('/ownerApp.json', patches);
    }
  } catch (err) {
    // Non-fatal — app works fine without /ownerApp being initialized
    console.warn('[ownerAppService] Init failed (non-fatal):', err.message);
  }
}

/**
 * Save a preference to /ownerApp/preferences — PATCH only.
 */
export async function savePreference(key, value) {
  await firebasePatch('/ownerApp/preferences.json', { [key]: value });
}

/**
 * Read preferences. Returns defaults if unavailable.
 */
export async function fetchPreferences() {
  try {
    const prefs = await firebaseGet('/ownerApp/preferences.json');
    return prefs ?? { ...DEFAULTS.preferences };
  } catch {
    return { ...DEFAULTS.preferences };
  }
}

/** Deep-merge data onto defaults without overwriting existing keys. */
function mergeWithDefaults(data, defaults) {
  if (!data || typeof data !== 'object') return { ...defaults };
  const result = { ...defaults };
  for (const key of Object.keys(data)) {
    if (
      data[key] !== null &&
      typeof data[key] === 'object' &&
      !Array.isArray(data[key]) &&
      typeof defaults[key] === 'object' &&
      defaults[key] !== null
    ) {
      result[key] = mergeWithDefaults(data[key], defaults[key]);
    } else if (data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  return result;
}
