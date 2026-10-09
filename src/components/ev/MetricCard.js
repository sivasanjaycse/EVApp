/**
 * MetricCard — compact card displaying a single metric with green vector icon.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Spacing, BorderRadius } from '@/theme/spacing';
import { GreenIcon } from './GreenIcon';

export function MetricCard({ label, value, unit, icon, iconName, accent, small }) {
  const iconKey = iconName || icon;

  return (
    <View style={[styles.card, small && styles.cardSmall]}>
      {iconKey ? (
        <View style={styles.iconContainer}>
          <GreenIcon name={iconKey} size={20} color={accent || Colors.primary} />
        </View>
      ) : null}
      <Text
        style={[
          styles.value,
          small && styles.valueSmall,
          accent && { color: accent },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSmall: {
    padding: Spacing.sm,
  },
  iconContainer: {
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  valueSmall: {
    fontSize: FontSize.xl,
  },
  unit: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
