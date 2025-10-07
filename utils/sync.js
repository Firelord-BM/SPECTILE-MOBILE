import NetInfo from '@react-native-community/netinfo';
import { syncBatch } from '../api/sync';
import { getUnsyncedRecords, markAsSynced } from './database';

let syncInterval = null;

export const startAutoSync = () => {
  // Sync every 5 minutes when online
  syncInterval = setInterval(async () => {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await performSync();
    }
  }, 5 * 60 * 1000);
};

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

export const performSync = async () => {
  try {
    console.log('Starting sync...');
    
    // Get all unsynced records
    const unsyncedData = await getUnsyncedRecords();
    
    if (
      unsyncedData.contacts.length === 0 &&
      unsyncedData.orders.length === 0 &&
      unsyncedData.activities.length === 0
    ) {
      console.log('Nothing to sync');
      return { success: true, synced: 0 };
    }
    
    // Send to server
    const response = await syncBatch({
      contacts: unsyncedData.contacts,
      orders: unsyncedData.orders,
      activities: unsyncedData.activities,
    });
    
    // Mark successful items as synced
    for (const syncId of response.successfulSyncs.contacts) {
      await markAsSynced('contacts', syncId);
    }
    for (const syncId of response.successfulSyncs.orders) {
      await markAsSynced('orders', syncId);
    }
    for (const syncId of response.successfulSyncs.activities) {
      await markAsSynced('activities', syncId);
    }
    
    console.log(`Sync completed: ${response.totalSynced} items`);
    
    return {
      success: true,
      synced: response.totalSynced,
      conflicts: response.conflicts || [],
    };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: error.message };
  }
};