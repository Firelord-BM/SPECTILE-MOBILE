import { StatCard } from '@/components/cards/StatsCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import { useContactStore } from '@/store/useContactStore';
import { router } from 'expo-router';
import { Activity, DollarSign, MapPin, Package, Plus, Target, Users } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function DashboardScreen() {
  const { loadContacts } = useContactStore();

  useEffect(() => {
    loadContacts();
  }, []);

  const quickActions = [
    { icon: Plus, label: 'New Order', route: '/order-form' },
    { icon: Users, label: 'Add Contact', route: '/contact-form' },
    { icon: Activity, label: 'Log Activity', route: '/activity-form' },
    { icon: MapPin, label: 'Route Plan', route: null },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ color: 'white' }}>
          Sales Dashboard
        </ThemedText>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Sales"
            value="KES 45,000"
            icon={DollarSign}
            color={theme.colors.success}
          />
          <StatCard
            title="Monthly Target"
            value="65%"
            icon={Target}
            color={theme.colors.primary}
          />
          <StatCard
            title="Active Leads"
            value="12"
            icon={Users}
            color={theme.colors.warning}
          />
          <StatCard
            title="Pending Orders"
            value="5"
            icon={Package}
            color={theme.colors.primary}
          />
        </View>

        {/* Quick Actions */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <View
              key={index}
              style={styles.quickAction}
              onTouchEnd={() => action.route && router.push(action.route as any)}
            >
              <action.icon size={28} color={theme.colors.primary} />
              <ThemedText style={styles.quickActionLabel}>{action.label}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    paddingTop: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickAction: {
    width: '47%',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});