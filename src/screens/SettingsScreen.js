/**
 * SettingsScreen — owner-app preferences and station diagnostics.
 *
 * Requirements:
 * - Station name
 * - Firebase connection status
 * - Temperature unit preference (°C / °F)
 * - Power display preference (kW / W)
 * - App version
 * - Last successful data refresh
 *
 * NOTE: Settings are strictly owner-app preferences.
 * NO station-control forms, hardware configuration, relay controls, or gate controls.
 * Saves preferences directly to /ownerApp/preferences.json via PATCH.
 */
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStationPolling } from '@/hooks/useStationPolling';
import { ConnectionIndicator } from '@/components/ev/ConnectionIndicator';
import { GreenIcon } from '@/components/ev/GreenIcon';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Spacing, BorderRadius } from '@/theme/spacing';
import {
  fetchPreferences,
  savePreference,
  initOwnerAppIfNeeded,
} from '@/services/ownerAppService';
import { formatTime } from '@/utils/formatters';

export default function SettingsScreen() {
  const { connectionStatus, lastUpdated } = useStationPolling();

  const [preferences, setPreferences] = useState({
    theme: 'green-white',
    temperatureUnit: 'C',
    powerUnit: 'kW',
  });
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        await initOwnerAppIfNeeded();
        const prefs = await fetchPreferences();
        setPreferences((prev) => ({ ...prev, ...prefs }));
      } catch (_err) {
        console.warn('Failed to load preferences');
      }
    }
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleTempUnit = async (unit) => {
    if (preferences.temperatureUnit === unit) return;
    setSavingKey('temp');
    try {
      await savePreference('temperatureUnit', unit);
      setPreferences((prev) => ({ ...prev, temperatureUnit: unit }));
    } catch (_err) {
      Alert.alert('Error', 'Unable to save temperature preference.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleTogglePowerUnit = async (unit) => {
    if (preferences.powerUnit === unit) return;
    setSavingKey('power');
    try {
      await savePreference('powerUnit', unit);
      setPreferences((prev) => ({ ...prev, powerUnit: unit }));
    } catch (_err) {
      Alert.alert('Error', 'Unable to save power unit preference.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Station Settings</Text>
          <Text style={styles.headerSub}>Owner Preferences & Diagnostics</Text>
        </View>
        <ConnectionIndicator status={connectionStatus} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section: Station Details ── */}
        <Text style={styles.sectionHeader}>Station Information</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Station Name</Text>
            <Text style={styles.settingValue}>EV Charging Station</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Firebase RTDB</Text>
            <Text style={styles.settingValue}>iot-proj-be-default-rtdb</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Connection Status</Text>
            <Text
              style={[
                styles.settingValue,
                connectionStatus === 'connected'
                  ? { color: Colors.success }
                  : { color: Colors.fault },
              ]}
            >
              {connectionStatus.toUpperCase()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Last Data Refresh</Text>
            <Text style={styles.settingValue}>
              {lastUpdated ? formatTime(lastUpdated.toISOString()) : 'Pending...'}
            </Text>
          </View>
        </View>

        {/* ── Section: App Preferences ── */}
        <Text style={styles.sectionHeader}>Display Preferences</Text>
        <View style={styles.card}>
          {/* Temperature Unit */}
          <View style={styles.preferenceRow}>
            <View style={styles.prefLabelContainer}>
              <Text style={styles.settingLabel}>Temperature Unit</Text>
              <Text style={styles.settingDescription}>
                Choose between Celsius (°C) and Fahrenheit (°F)
              </Text>
            </View>
            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  preferences.temperatureUnit === 'C' && styles.unitButtonActive,
                ]}
                onPress={() => handleToggleTempUnit('C')}
                disabled={savingKey === 'temp'}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    preferences.temperatureUnit === 'C' && styles.unitButtonTextActive,
                  ]}
                >
                  °C
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  preferences.temperatureUnit === 'F' && styles.unitButtonActive,
                ]}
                onPress={() => handleToggleTempUnit('F')}
                disabled={savingKey === 'temp'}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    preferences.temperatureUnit === 'F' && styles.unitButtonTextActive,
                  ]}
                >
                  °F
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Power Unit */}
          <View style={styles.preferenceRow}>
            <View style={styles.prefLabelContainer}>
              <Text style={styles.settingLabel}>Power Display Unit</Text>
              <Text style={styles.settingDescription}>
                Display power readings in Kilowatts or Watts
              </Text>
            </View>
            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  preferences.powerUnit === 'kW' && styles.unitButtonActive,
                ]}
                onPress={() => handleTogglePowerUnit('kW')}
                disabled={savingKey === 'power'}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    preferences.powerUnit === 'kW' && styles.unitButtonTextActive,
                  ]}
                >
                  kW
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  preferences.powerUnit === 'W' && styles.unitButtonActive,
                ]}
                onPress={() => handleTogglePowerUnit('W')}
                disabled={savingKey === 'power'}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    preferences.powerUnit === 'W' && styles.unitButtonTextActive,
                  ]}
                >
                  W
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Section: Application Details ── */}
        <Text style={styles.sectionHeader}>Application Details</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.settingValue}>1.0.0 (Production Build)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Access Role</Text>
            <Text style={styles.settingValue}>Station Owner / Admin</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>Green & White Eco</Text>
          </View>
        </View>

        {/* ── Read-Only Notice ── */}
        <View style={styles.noticeBox}>
          <View style={styles.noticeTitleRow}>
            <GreenIcon name="shield" size={18} color={Colors.primaryDark} />
            <Text style={styles.noticeTitle}>Administrator Read-Only Mode</Text>
          </View>
          <Text style={styles.noticeText}>
            Relay controls, gate actuation, and charge session switches are managed
            strictly by on-site ESP32 firmware safety interlocks. No remote actuator overrides
            are permitted from this client.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  sectionHeader: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  settingLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  settingValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  settingDescription: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  prefLabelContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.sm - 2,
  },
  unitButtonActive: {
    backgroundColor: Colors.primary,
  },
  unitButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  unitButtonTextActive: {
    color: Colors.card,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  noticeBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryDark,
    gap: 4,
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
  },
  noticeText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 30,
  },
});
