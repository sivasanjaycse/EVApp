/**
 * PortMonitoringScreen — detailed per-port telemetry.
 *
 * Displays full readings for Port 1, 2, and 3 from Firebase.
 * Highlights voltage > 240V or current > 32A (display only — no controls).
 * Power is displayed in kW (converted from watts stored in Firebase).
 *
 * Firebase paths read (read-only):
 *   /station/ports.json
 *   /station/station.json  (for status context)
 *   /station/device.json   (for uptime)
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
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Spacing, BorderRadius } from '@/theme/spacing';
import { PortCard } from '@/components/ev/PortCard';
import { ConnectionIndicator } from '@/components/ev/ConnectionIndicator';
import { GreenIcon } from '@/components/ev/GreenIcon';
import {
  formatNumber,
  formatPowerKW,
  formatUptime,
  formatRelativeTime,
} from '@/utils/formatters';
import {
  isVoltageAbnormal,
  isCurrentAbnormal,
  VOLTAGE_LIMIT,
  CURRENT_LIMIT,
} from '@/utils/stationCalculations';

function DetailRow({ label, value, unit, abnormal, highlight }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailRight}>
        {abnormal && (
          <View style={styles.abnormalBadge}>
            <Text style={styles.abnormalBadgeText}>OVER LIMIT</Text>
          </View>
        )}
        <Text
          style={[
            styles.detailValue,
            abnormal && { color: Colors.fault },
            highlight && { color: Colors.primary },
          ]}
        >
          {value}
          {unit ? <Text style={styles.detailUnit}> {unit}</Text> : null}
        </Text>
      </View>
    </View>
  );
}

function PortDetailCard({ portNumber, port }) {
  const voltage = port?.voltage;
  const current = port?.current;
  const powerW = port?.power;
  const distance = port?.distance;

  const voltageAbnormal = isVoltageAbnormal(voltage);
  const currentAbnormal = isCurrentAbnormal(current);

  return (
    <View style={styles.detailCard}>
      <PortCard portNumber={portNumber} port={port} compact={false} />
      <View style={styles.extraReadings}>
        <Text style={styles.extraTitle}>Sensor Readings</Text>
        <DetailRow
          label="Voltage"
          value={formatNumber(voltage, 2)}
          unit={`V  (limit: ${VOLTAGE_LIMIT}V)`}
          abnormal={voltageAbnormal}
        />
        <DetailRow
          label="Current"
          value={formatNumber(current, 2)}
          unit={`A  (limit: ${CURRENT_LIMIT}A)`}
          abnormal={currentAbnormal}
        />
        <DetailRow
          label="Power"
          value={formatPowerKW(powerW, 3)}
          unit="kW"
        />
        <DetailRow
          label="Power (raw)"
          value={formatNumber(powerW, 1)}
          unit="W"
        />
        <DetailRow
          label="Distance (ultrasonic)"
          value={distance != null && isFinite(distance) ? formatNumber(distance, 1) : '—'}
          unit="cm"
          highlight={distance != null && distance < 10}
        />
      </View>
    </View>
  );
}

export default function PortMonitoringScreen() {
  const {
    ports,
    device,
    stationInfo,
    connectionStatus,
    lastUpdated,
    isLoading,
  } = useStationPolling();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Port Monitoring</Text>
          <Text style={styles.headerSub}>
            {lastUpdated ? `Updated ${formatRelativeTime(lastUpdated)}` : 'Connecting…'}
          </Text>
        </View>
        <ConnectionIndicator status={connectionStatus} />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading port data…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Device info strip */}
          <View style={styles.deviceStrip}>
            <View style={styles.deviceRow}>
              <GreenIcon name="wifi" size={14} />
              <Text style={styles.deviceItem}>
                ESP32 Wi-Fi:{' '}
                <Text style={{ color: device?.wifiConnected ? Colors.primary : Colors.fault }}>
                  {device?.wifiConnected === true
                    ? 'Connected'
                    : device?.wifiConnected === false
                    ? 'Disconnected'
                    : '—'}
                </Text>
              </Text>
            </View>
            <View style={styles.deviceRow}>
              <GreenIcon name="uptime" size={14} />
              <Text style={styles.deviceItem}>
                Uptime: {formatUptime(device?.uptimeMs)}
              </Text>
            </View>
            <View style={styles.deviceRow}>
              <GreenIcon name="shield" size={14} />
              <Text style={styles.deviceItem}>
                Station: {stationInfo?.status ?? '—'}
              </Text>
            </View>
          </View>

          {/* Safety note */}
          <View style={styles.safetyNote}>
            <GreenIcon name="info" size={16} color={Colors.primaryDark} />
            <Text style={styles.safetyNoteText}>
              Readings above {VOLTAGE_LIMIT}V or {CURRENT_LIMIT}A are highlighted. Fault handling is managed by the ESP32 firmware — no controls are available here.
            </Text>
          </View>

          {/* Per-port detail cards */}
          {['port1', 'port2', 'port3'].map((key, i) => (
            <PortDetailCard key={key} portNumber={i + 1} port={ports?.[key]} />
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
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
    gap: Spacing.md,
  },
  deviceStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deviceItem: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  safetyNote: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  safetyNoteText: {
    fontSize: FontSize.xs,
    color: '#92400E',
    lineHeight: 18,
  },
  detailCard: {
    gap: Spacing.sm,
  },
  extraReadings: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  extraTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  detailUnit: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
  },
  abnormalBadge: {
    backgroundColor: Colors.faultLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  abnormalBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.fault,
  },
  bottomSpacer: {
    height: 20,
  },
});
