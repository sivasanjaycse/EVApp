/**
 * ConnectionIndicator — shows Connected / Reconnecting / Offline status.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Spacing } from '@/theme/spacing';

export function ConnectionIndicator({ status }) {
  const config = {
    connected: {
      dot: Colors.success,
      label: 'Connected',
      bg: Colors.successLight,
      text: Colors.primary,
    },
    reconnecting: {
      dot: Colors.warning,
      label: 'Reconnecting',
      bg: Colors.warningLight,
      text: '#92400E',
    },
    offline: {
      dot: Colors.offline,
      label: 'Offline',
      bg: Colors.offlineLight,
      text: Colors.textSecondary,
    },
  }[status] ?? {
    dot: Colors.offline,
    label: 'Unknown',
    bg: Colors.offlineLight,
    text: Colors.textSecondary,
  };

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
