/**
 * useStationPolling — custom hook for live Firebase telemetry.
 *
 * Polls /station every 2–3 seconds.
 * Cleans up the interval on unmount.
 * Preserves last known readings on fetch failure (shows stale indicator).
 * Never fabricates zero values on error.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchStationData } from '@/services/stationService';
import { processLiveTelemetry } from '@/services/analyticsService';

const POLL_INTERVAL_MS = 2500;

export function useStationPolling() {
  const [stationInfo, setStationInfo] = useState(null);
  const [ports, setPorts] = useState(null);
  const [device, setDevice] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('reconnecting');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tracks whether a request is in-flight to avoid overlapping polls
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (inFlightRef.current) return; // skip if previous is still running
    inFlightRef.current = true;

    try {
      const { stationInfo: si, ports: p, device: d } = await fetchStationData();

      if (!mountedRef.current) return;

      setStationInfo(si);
      setPorts(p);
      setDevice(d);
      setConnectionStatus('connected');
      setLastUpdated(new Date());
      setError(null);

      // Autonomous realtime analytics logging to /ownerApp/analytics (no user input)
      processLiveTelemetry({ stationInfo: si, ports: p, device: d }).catch(() => {});
    } catch (err) {
      if (!mountedRef.current) return;
      // Preserve last known readings — do not zero them out
      setConnectionStatus('offline');
      setError(err.message ?? 'Connection error');
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch immediately via timer
    const initialTimer = setTimeout(() => {
      fetchData();
    }, 0);

    const interval = setInterval(fetchData, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchData]);

  return {
    stationInfo,
    ports,
    device,
    connectionStatus,
    lastUpdated,
    isLoading,
    error,
  };
}
