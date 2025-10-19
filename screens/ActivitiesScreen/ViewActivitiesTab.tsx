import { theme } from '@/constants/theme';
import { useActivityStore } from '@/store/useActivityStore';
import { Cloud, CloudOff, Mail, Phone, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function ActivityCard({ activity }: any) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return { dateStr, timeStr };
  };

  const handlePhonePress = () => {
    if (activity.phone) {
      Linking.openURL(`tel:${activity.phone}`);
    }
  };

  const handleEmailPress = () => {
    if (activity.email) {
      Linking.openURL(`mailto:${activity.email}`);
    }
  };

  const { dateStr, timeStr } = formatDate(activity.timestamp);

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={() => setExpanded(!expanded)} 
        activeOpacity={0.7}
        style={styles.cardHeader}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.businessNameRow}>
              <Text style={styles.businessName}>{activity.businessName}</Text>
              {!activity.synced && (
                <View style={styles.unsyncedBadge}>
                  <CloudOff size={12} color="#EF4444" />
                </View>
              )}
              {activity.synced && (
                <View style={styles.syncedBadge}>
                  <Cloud size={12} color="#10B981" />
                </View>
              )}
            </View>
            <Text style={styles.contactPerson}>{activity.contactPerson}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.activityTypeBadge}>
              <Text style={styles.activityTypeText}>{activity.activityType}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerBottom}>
          <Text style={styles.dateTime}>{dateStr} • {timeStr}</Text>
          <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.accordionContent}>
          {(activity.email || activity.phone) && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              {activity.phone && (
                <TouchableOpacity 
                  style={styles.contactItem} 
                  onPress={handlePhonePress}
                  activeOpacity={0.6}
                >
                  <Phone size={18} color={theme.colors.primary} />
                  <Text style={styles.contactText}>{activity.phone}</Text>
                </TouchableOpacity>
              )}
              
              {activity.email && (
                <TouchableOpacity 
                  style={styles.contactItem} 
                  onPress={handleEmailPress}
                  activeOpacity={0.6}
                >
                  <Mail size={18} color={theme.colors.primary} />
                  <Text style={styles.contactText}>{activity.email}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {activity.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{activity.notes}</Text>
            </View>
          )}

          {activity.location && (
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.locationText}>
                {activity.location.latitude.toFixed(6)}, {activity.location.longitude.toFixed(6)}
              </Text>
              {activity.location.accuracy && (
                <Text style={styles.accuracyText}>
                  Accuracy: ±{activity.location.accuracy.toFixed(0)}m
                </Text>
              )}
            </View>
          )}

          <View style={styles.syncStatusSection}>
            <Text style={styles.sectionTitle}>Sync Status</Text>
            <View style={styles.syncStatusRow}>
              {activity.synced ? (
                <>
                  <Cloud size={16} color="#10B981" />
                  <Text style={styles.syncedText}>Synced to server</Text>
                </>
              ) : (
                <>
                  <CloudOff size={16} color="#EF4444" />
                  <Text style={styles.unsyncedText}>Not synced - will upload when online</Text>
                </>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// Main ViewActivitiesTab Component
export default function ViewActivitiesTab() {
  const { activities, isOnline, fetchActivitiesFromServer } = useActivityStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch activities from server when component mounts and online
    if (isOnline) {
      handleRefresh();
    }
  }, [isOnline]);

  const handleRefresh = async () => {
    if (!isOnline) {
      return;
    }

    setRefreshing(true);
    try {
      await fetchActivitiesFromServer();
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No activities recorded yet</Text>
        <Text style={styles.emptySubtext}>
          Switch to Record Activity tab to log your first activity
        </Text>
        {isOnline && (
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <RefreshCw size={16} color={theme.colors.primary} />
                <Text style={styles.refreshButtonText}>Refresh from Server</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const unsyncedCount = activities.filter(a => !a.synced).length;

  return (
    <View style={styles.container}>
      {unsyncedCount > 0 && (
        <View style={styles.unsyncedBanner}>
          <CloudOff size={16} color="#DC2626" />
          <Text style={styles.unsyncedBannerText}>
            {unsyncedCount} {unsyncedCount === 1 ? 'activity' : 'activities'} pending sync
          </Text>
        </View>
      )}

      <FlatList
        data={activities}
        keyExtractor={(item, index) => item.id || item.syncId || index.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          isOnline ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          ) : undefined
        }
        ListFooterComponent={
          isOnline ? (
            <TouchableOpacity 
              style={styles.loadMoreButton} 
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <RefreshCw size={16} color={theme.colors.primary} />
                  <Text style={styles.loadMoreText}>Refresh from Server</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  unsyncedBanner: {
    backgroundColor: '#FEE2E2',
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  unsyncedBannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#991B1B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  businessNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  syncedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 2,
  },
  unsyncedBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 2,
  },
  contactPerson: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  activityTypeBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  dateTime: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  expandIcon: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  accordionContent: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  contactSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  contactText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  notesSection: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  locationSection: {
    marginBottom: theme.spacing.lg,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  syncStatusSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  syncedText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '500',
  },
  unsyncedText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '500',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});