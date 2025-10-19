import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import RecordActivityTab from '@/screens/ActivitiesScreen/RecordActivityTab';
import ViewActivitiesTab from '@/screens/ActivitiesScreen/ViewActivitiesTab';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ActivitiesScreen() {
  const [activeTab, setActiveTab] = useState<'record' | 'view'>('record');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'record' && styles.activeTab]}
          onPress={() => setActiveTab('record')}
        >
          <Text style={[styles.tabText, activeTab === 'record' && styles.activeTabText]}>
            Record Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'view' && styles.activeTab]}
          onPress={() => setActiveTab('view')}
        >
          <Text style={[styles.tabText, activeTab === 'view' && styles.activeTabText]}>
            View Activities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'record' ? <RecordActivityTab /> : <ViewActivitiesTab />}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
});