// store/useActivityStore.ts
import { activityApi, ActivityDTO } from '@/services/activityApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Activity {
  id: string;
  syncId: string;
  activityType: string;
  businessName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    timestamp?: string;
  } | null;
  timestamp: string;
  synced?: boolean; // Track if synced with server
  serverId?: number; // Server-assigned ID
}

interface ActivityState {
  activities: Activity[];
  isOnline: boolean;
  isSyncing: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'syncId' | 'synced'>) => Promise<Activity>;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => Promise<void>;
  getActivityById: (id: string) => Activity | undefined;
  syncActivities: () => Promise<void>;
  fetchActivitiesFromServer: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      isOnline: true,
      isSyncing: false,

      setOnlineStatus: (status: boolean) => {
        set({ isOnline: status });
        if (status) {
          // Auto-sync when coming online
          get().syncActivities();
        }
      },

      addActivity: async (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: Date.now().toString(),
          syncId: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: activityData.timestamp || new Date().toISOString(),
          synced: false,
        };

        // Add to local storage immediately
        set((state) => ({
          activities: [newActivity, ...state.activities],
        }));

        // Try to sync to server if online
        if (get().isOnline) {
          try {
            const serverActivity = await activityApi.createActivity({
              syncId: newActivity.syncId,
              activityType: newActivity.activityType,
              businessName: newActivity.businessName,
              contactPerson: newActivity.contactPerson,
              email: newActivity.email,
              phone: newActivity.phone,
              notes: newActivity.notes,
              location: newActivity.location,
              timestamp: newActivity.timestamp,
            });

            // Update local activity with server ID and mark as synced
            set((state) => ({
              activities: state.activities.map((activity) =>
                activity.id === newActivity.id
                  ? { ...activity, synced: true, serverId: serverActivity.id }
                  : activity
              ),
            }));
          } catch (error) {
            console.error('Failed to sync activity to server:', error);
            // Activity remains in local storage with synced: false
          }
        }

        return newActivity;
      },

      updateActivity: (id, updates) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === id ? { ...activity, ...updates, synced: false } : activity
          ),
        }));

        // Try to sync update to server if online
        const activity = get().activities.find((a) => a.id === id);
        if (get().isOnline && activity?.serverId) {
          activityApi.updateActivity(activity.serverId, updates as Partial<ActivityDTO>)
            .then(() => {
              set((state) => ({
                activities: state.activities.map((a) =>
                  a.id === id ? { ...a, synced: true } : a
                ),
              }));
            })
            .catch((error) => {
              console.error('Failed to update activity on server:', error);
            });
        }
      },

      deleteActivity: async (id) => {
        const activity = get().activities.find((a) => a.id === id);
        
        // Remove from local storage
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== id),
        }));

        // Try to delete from server if synced and online
        if (get().isOnline && activity?.serverId) {
          try {
            await activityApi.deleteActivity(activity.serverId);
          } catch (error) {
            console.error('Failed to delete activity from server:', error);
          }
        }
      },

      getActivityById: (id) => {
        return get().activities.find((activity) => activity.id === id);
      },

      syncActivities: async () => {
        if (!get().isOnline || get().isSyncing) return;

        set({ isSyncing: true });

        try {
          const unsyncedActivities = get().activities.filter((a) => !a.synced);
          
          if (unsyncedActivities.length > 0) {
            const activityDTOs: ActivityDTO[] = unsyncedActivities.map((a) => ({
              syncId: a.syncId,
              activityType: a.activityType,
              businessName: a.businessName,
              contactPerson: a.contactPerson,
              email: a.email,
              phone: a.phone,
              notes: a.notes,
              location: a.location,
              timestamp: a.timestamp,
            }));

            const result = await activityApi.syncPendingActivities(activityDTOs);
            
            console.log(`Synced ${result.synced} activities, ${result.failed} failed`);

            // Mark all as synced (optimistic update)
            set((state) => ({
              activities: state.activities.map((activity) => ({
                ...activity,
                synced: true,
              })),
            }));
          }
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      fetchActivitiesFromServer: async () => {
        if (!get().isOnline) return;

        try {
          const serverActivities = await activityApi.getRecentActivities(0, 100);
          
          // Merge server activities with local ones
          const localActivities = get().activities;
          const mergedActivities: Activity[] = [];
          const syncIds = new Set<string>();

          // Add server activities
          serverActivities.content.forEach((serverActivity) => {
            syncIds.add(serverActivity.syncId);
            mergedActivities.push({
              id: serverActivity.id?.toString() || serverActivity.syncId,
              syncId: serverActivity.syncId,
              activityType: serverActivity.activityType,
              businessName: serverActivity.businessName,
              contactPerson: serverActivity.contactPerson,
              email: serverActivity.email,
              phone: serverActivity.phone,
              notes: serverActivity.notes,
              location: serverActivity.location,
              timestamp: serverActivity.timestamp,
              synced: true,
              serverId: serverActivity.id,
            });
          });

          // Add local-only activities that aren't on server yet
          localActivities.forEach((localActivity) => {
            if (!syncIds.has(localActivity.syncId)) {
              mergedActivities.push(localActivity);
            }
          });

          // Sort by timestamp (newest first)
          mergedActivities.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          set({ activities: mergedActivities });
        } catch (error) {
          console.error('Failed to fetch activities from server:', error);
        }
      },
    }),
    {
      name: 'activity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);