/**
 * StationHeader — brand header for the dashboard.
 * Shows logo, station name, connection status, and last-updated time.
 */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Spacing } from '@/theme/spacing';
import { ConnectionIndicator } from './ConnectionIndicator';
import { formatRelativeTime } from '@/utils/formatters';

export function StationHeader({ connectionStatus, lastUpdated }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Logo */}
        <Image
          source={require('@/assets/images/ev-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.stationName}>EV Charging Station</Text>
          <Text style={styles.subtitle}>Owner Dashboard</Text>
        </View>
        {/* Connection status */}
        <ConnectionIndicator status={connectionStatus} />
      </View>

      {/* Last updated */}
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {formatRelativeTime(lastUpdated)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 1,
  },
  stationName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  lastUpdated: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
