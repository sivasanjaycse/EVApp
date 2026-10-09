/**
 * PortCard — displays live telemetry for a single charging port.
 *
 * Visual states: available / vehiclePresent / charging / fault
 * Highlights abnormal readings (voltage > 240V, current > 32A).
 * Uses GreenIcon exclusively (no emojis).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Spacing, BorderRadius } from '@/theme/spacing';
import {
  getPortState,
  getPortStateLabel,
  isVoltageAbnormal,
  isCurrentAbnormal,
} from '@/utils/stationCalculations';
import { formatNumber, formatPowerKW } from '@/utils/formatters';
import { GreenIcon } from './GreenIcon';

const STATE_CONFIG = {
  available: {
    border: Colors.border,
    badge: Colors.successLight,
    badgeText: Colors.primary,
    dot: Colors.success,
    icon: 'plug',
  },
  vehiclePresent: {
    border: Colors.vehiclePresent,
    badge: Colors.vehiclePresentLight,
    badgeText: Colors.vehiclePresent,
    dot: Colors.vehiclePresent,
    icon: 'car',
  },
  charging: {
    border: Colors.charging,
    badge: Colors.chargingLight,
    badgeText: Colors.primaryDark,
    dot: Colors.charging,
    icon: 'charging',
  },
  fault: {
    border: Colors.fault,
    badge: Colors.faultLight,
    badgeText: Colors.fault,
    dot: Colors.fault,
    icon: 'fault',
  },
};

function ReadingRow({ label, value, unit, abnormal }) {
  return (
    <View style={styles.readingRow}>
      <Text style={styles.readingLabel}>{label}</Text>
      <Text
        style={[
          styles.readingValue,
          abnormal && styles.readingAbnormal,
        ]}
      >
        {value}
        {unit ? <Text style={styles.readingUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

export function PortCard({ portNumber, port, compact }) {
  const state = getPortState(port);
  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.available;

  const voltage = port?.voltage;
  const current = port?.current;
  const powerW = port?.power;
  const distance = port?.distance;

  const voltageAbnormal = isVoltageAbnormal(voltage);
  const currentAbnormal = isCurrentAbnormal(current);

  return (
    <View
      style={[
        styles.card,
        { borderColor: cfg.border, borderLeftColor: cfg.dot, borderLeftWidth: 4 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.portLabel}>
          <GreenIcon name={cfg.icon} size={20} color={cfg.dot} />
          <Text style={styles.portNumber}>Port {portNumber}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.badge }]}>
          <View style={[styles.badgeDot, { backgroundColor: cfg.dot }]} />
          <Text style={[styles.badgeText, { color: cfg.badgeText }]}>
            {getPortStateLabel(state)}
          </Text>
        </View>
      </View>

      {/* Readings */}
      {!compact && (
        <View style={styles.readings}>
          <ReadingRow
            label="Voltage"
            value={formatNumber(voltage, 1)}
            unit="V"
            abnormal={voltageAbnormal}
          />
          <ReadingRow
            label="Current"
            value={formatNumber(current, 2)}
            unit="A"
            abnormal={currentAbnormal}
          />
          <ReadingRow
            label="Power"
            value={formatPowerKW(powerW, 2)}
            unit="kW"
          />
          <ReadingRow
            label="Distance"
            value={distance != null && isFinite(distance) ? formatNumber(distance, 1) : '—'}
            unit="cm"
          />
        </View>
      )}

      {compact && (
        <View style={styles.compactRow}>
          <Text style={[styles.compactVal, voltageAbnormal && styles.readingAbnormal]}>
            {formatNumber(voltage, 0)}V
          </Text>
          <Text style={styles.compactSep}>·</Text>
          <Text style={[styles.compactVal, currentAbnormal && styles.readingAbnormal]}>
            {formatNumber(current, 1)}A
          </Text>
          <Text style={styles.compactSep}>·</Text>
          <Text style={styles.compactVal}>{formatPowerKW(powerW, 1)} kW</Text>
        </View>
      )}

      {/* Fault banner */}
      {state === 'fault' && (
        <View style={styles.faultBanner}>
          <GreenIcon name="fault" size={14} color={Colors.fault} />
          <Text style={styles.faultText}>Fault reported by ESP32</Text>
        </View>
      )}

      {/* Abnormal reading warnings */}
      {(voltageAbnormal || currentAbnormal) && state !== 'fault' && (
        <View style={styles.warnBanner}>
          <GreenIcon name="warning" size={14} color={Colors.warning} />
          <Text style={styles.warnText}>
            {voltageAbnormal ? 'Voltage above 240V limit  ' : ''}
            {currentAbnormal ? 'Current above 32A limit' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  portLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portNumber: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  readings: {
    gap: 6,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  readingLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  readingValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  readingUnit: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
  },
  readingAbnormal: {
    color: Colors.fault,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  compactVal: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  compactSep: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  faultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.faultLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  faultText: {
    fontSize: FontSize.xs,
    color: Colors.fault,
    fontWeight: FontWeight.semibold,
  },
  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  warnText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.semibold,
  },
});
