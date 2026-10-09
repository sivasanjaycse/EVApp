/**
 * GreenIcon — central icon component ensuring ALL app icons are styled in green.
 *
 * Uses @expo/vector-icons (MaterialCommunityIcons).
 * Replaces all emojis with crisp, professional vector icons rendered in green.
 */
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';

const ICON_MAP = {
  // Ports & Power
  plug: 'power-plug',
  charging: 'lightning-bolt',
  flash: 'lightning-bolt',
  power: 'flash',
  car: 'car-electric',
  vehicle: 'car-electric',
  available: 'check-circle-outline',
  battery: 'battery-charging-high',

  // Status & Safety
  check: 'check-circle',
  normal: 'shield-check',
  emergency: 'alert-decagram',
  fault: 'alert-circle',
  warning: 'alert',
  shield: 'shield-check',

  // Sensors & Environment
  temperature: 'thermometer',
  humidity: 'water-percent',
  smoke: 'smoke-detector-variant',
  smokeAlert: 'fire-alert',
  gateOpen: 'door-sliding-open',
  gateClosed: 'door-sliding-lock',
  wifi: 'wifi',
  uptime: 'clock-outline',
  distance: 'ruler',

  // Analytics & Charts
  analytics: 'chart-bar',
  trend: 'chart-line',
  pulse: 'pulse',
  sessions: 'refresh',
  info: 'information-outline',
};

export function GreenIcon({
  name,
  size = 20,
  color = Colors.primary,
  accent = false,
  style,
}) {
  const iconName = ICON_MAP[name] || name || 'circle-outline';
  const iconColor = accent ? Colors.primaryAccent : color;

  return (
    <MaterialCommunityIcons
      name={iconName}
      size={size}
      color={iconColor}
      style={style}
    />
  );
}
