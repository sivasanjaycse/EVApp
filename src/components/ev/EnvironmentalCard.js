/**
 * EnvironmentalCard — shows temperature, humidity, smoke, gate, and Wi-Fi.
 * All icons rendered via GreenIcon (no emojis).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Spacing, BorderRadius } from '@/theme/spacing';
import { formatTemperature, formatNumber } from '@/utils/formatters';
import { GreenIcon } from './GreenIcon';

function EnvRow({ iconName, label, value, valueColor }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrapper}>
        <GreenIcon name={iconName} size={16} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

export function EnvironmentalCard({ stationInfo, temperatureUnit = 'C' }) {
  const temperature = stationInfo?.temperature;
  const humidity = stationInfo?.humidity;
  const smokeDetected = stationInfo?.smokeDetected;
  const gateStatus = stationInfo?.gateStatus;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <GreenIcon name="temperature" size={18} />
        <Text style={styles.cardTitle}>Environmental Monitoring</Text>
      </View>

      <View style={styles.rows}>
        <EnvRow
          iconName="temperature"
          label="Temperature"
          value={
            temperature != null && isFinite(temperature)
              ? formatTemperature(temperature, temperatureUnit)
              : '—'
          }
        />
        <EnvRow
          iconName="humidity"
          label="Humidity"
          value={
            humidity != null && isFinite(humidity)
              ? `${formatNumber(humidity, 1)}%`
              : '—'
          }
        />
        <EnvRow
          iconName={smokeDetected ? 'smokeAlert' : 'smoke'}
          label="Smoke Status"
          value={
            smokeDetected === true
              ? 'ALERT DETECTED'
              : smokeDetected === false
              ? 'Clear / Normal'
              : '—'
          }
          valueColor={smokeDetected === true ? Colors.fault : Colors.primary}
        />
        <EnvRow
          iconName={gateStatus === 'OPEN' ? 'gateOpen' : 'gateClosed'}
          label="Gate"
          value={gateStatus ?? '—'}
          valueColor={
            gateStatus === 'OPEN'
              ? Colors.primary
              : gateStatus === 'CLOSED'
              ? Colors.textSecondary
              : null
          }
        />
      </View>
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
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  iconWrapper: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  rowValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
