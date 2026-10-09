/**
 * Firebase REST API base helpers.
 *
 * Uses the Firebase Realtime Database REST API exclusively via fetch().
 * No Firebase JS SDK. No backend server.
 *
 * Firebase URL is pulled from app.json / EAS env. Falls back to the
 * hard-coded public URL because it contains no secret credentials — the
 * URL itself is not a secret; access is controlled by database rules.
 */

const FIREBASE_BASE_URL =
  process.env.EXPO_PUBLIC_FIREBASE_URL ||
  'https://iot-proj-be-default-rtdb.firebaseio.com';

const REQUEST_TIMEOUT_MS = 8000;

/**
 * GET a Firebase REST path.
 * Returns parsed JSON or throws on network error / non-2xx.
 */
export async function firebaseGet(path) {
  const url = `${FIREBASE_BASE_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error(`Firebase GET ${path} failed: HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * PATCH a Firebase REST path (partial update — does NOT overwrite siblings).
 * Only used for /ownerApp paths. NEVER called on /station.
 */
export async function firebasePatch(path, data) {
  const url = `${FIREBASE_BASE_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error(`Firebase PATCH ${path} failed: HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
