/**
 * DashboardScreen — main landing screen.
 *
 * Reads live data via useStationPolling (polls every 2.5s).
 * Displays: header, summary cards, port overview, environmental monitoring.
 *
 * ALERTS INTEGRATION PLACEHOLDER
 * --------------------------------
 * A teammate is implementing the alerts system. This screen reserves
 * a clearly marked section below the summary cards for that integration.
 * Do NOT add alert logic here — wait for the teammate's component.
 * The placeholder is keyed as <AlertsPlaceholder /> for easy search.
 *
 * Firebase paths read (read-only):
 *   /station/station.json
 *   /station/ports.json
 *   /station/device.json
 */
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStationPolling } from '@/hooks/useStationPolling';
import { StationHeader } from '@/components/ev/StationHeader';
import { MetricCard } from '@/components/ev/MetricCard';
import { PortCard } from '@/components/ev/PortCard';
import { EnvironmentalCard } from '@/components/ev/EnvironmentalCard';
import { GreenIcon } from '@/components/ev/GreenIcon';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Spacing, BorderRadius } from '@/theme/spacing';
import { countChargingPorts } from '@/services/stationService';
import { formatNumber } from '@/utils/formatters';

/**
 * ALERTS INTEGRATION PLACEHOLDER
 * Replace this component with the teammate's AlertsBanner when ready.
 * Do not implement alert logic here.
 */
function AlertsPlaceholder() {
  // NOTE TO TEAMMATE: Replace this View with your AlertsBanner component.
  // Data source: will be a separate /alerts Firebase path (TBD by teammate).
  // Props expected: none initially — the component fetches its own data.
  return null; // Intentionally renders nothing until alerts are implemented
}

export default function DashboardScreen() {
  const {
    stationInfo,
    ports,
    device,
    connectionStatus,
    lastUpdated,
    isLoading,
  } = useStationPolling();

  const stationStatus = stationInfo?.status ?? '—';
  const occupiedPorts = stationInfo?.occupiedPorts;
  const availablePorts = stationInfo?.availablePorts;
  const chargingCount = countChargingPorts(ports);

  const isEmergency = stationStatus === 'EMERGENCY';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StationHeader connectionStatus="reconnecting" lastUpdated={null} />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading station data…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StationHeader
        connectionStatus={connectionStatus}
        lastUpdated={lastUpdated}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Station Status Banner ── */}
        <View
          style={[
            styles.statusBanner,
            isEmergency
              ? styles.statusBannerEmergency
              : styles.statusBannerNormal,
          ]}
        >
          <GreenIcon
            name={isEmergency ? 'emergency' : 'normal'}
            size={22}
            color={isEmergency ? Colors.fault : Colors.primary}
          />
          <Text
            style={[
              styles.statusText,
              isEmergency ? { color: Colors.fault } : { color: Colors.primary },
            ]}
          >
            Station Status: {stationStatus}
          </Text>
        </View>

        {/* ── ALERTS INTEGRATION PLACEHOLDER ── */}
        {/* Teammate: add your <AlertsBanner /> below this comment */}
        <AlertsPlaceholder />

        {/* ── Summary Cards ── */}
        <SectionTitle>Overview</SectionTitle>
        <View style={styles.metricsRow}>
          <MetricCard
            label="Total Ports"
            value="3"
            iconName="plug"
            accent={Colors.primaryDark}
          />
          <MetricCard
            label="Occupied"
            value={occupiedPorts != null ? String(occupiedPorts) : '—'}
            iconName="car"
            accent={Colors.vehiclePresent}
          />
          <MetricCard
            label="Available"
            value={availablePorts != null ? String(availablePorts) : '—'}
            iconName="available"
            accent={Colors.primary}
          />
        </View>
        <View style={styles.metricsRow}>
          <MetricCard
            label="Charging"
            value={String(chargingCount)}
            iconName="charging"
            accent={Colors.charging}
          />
          <MetricCard
            label="Wi-Fi"
            value={
              device?.wifiConnected === true
                ? 'Online'
                : device?.wifiConnected === false
                ? 'Offline'
                : '—'
            }
            iconName="wifi"
            accent={
              device?.wifiConnected === true ? Colors.primary : Colors.offline
            }
          />
          <MetricCard
            label="Temperature"
            value={
              stationInfo?.temperature != null &&
              isFinite(stationInfo.temperature)
                ? formatNumber(stationInfo.temperature, 1)
                : '—'
            }
            unit="°C"
            iconName="temperature"
          />
        </View>

        {/* ── Port Overview ── */}
        <SectionTitle>Port Status</SectionTitle>
        <View style={styles.portsSection}>
          {['port1', 'port2', 'port3'].map((key, i) => (
            <PortCard
              key={key}
              portNumber={i + 1}
              port={ports?.[key]}
              compact
            />
          ))}
        </View>

        {/* ── Environmental ── */}
        <SectionTitle>Environmental</SectionTitle>
        <EnvironmentalCard stationInfo={stationInfo} />

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  loadingText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 4,
  },
  statusBannerNormal: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.border,
  },
  statusBannerEmergency: {
    backgroundColor: Colors.faultLight,
    borderColor: Colors.fault,
  },
  statusIcon: {
    fontSize: 18,
  },
  statusText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  portsSection: {
    gap: Spacing.sm,
  },
  bottomSpacer: {
    height: 20,
  },
});
