import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    await storeLocationBreadcrumb(locations[0]);
  }
});

export const startBackgroundLocationTracking = async () => {
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 300000,
    distanceInterval: 100,
    foregroundService: {
      notificationTitle: 'Sales App',
      notificationBody: 'Tracking your sales route',
    },
  });
};