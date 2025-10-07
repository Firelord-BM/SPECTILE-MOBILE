import * as Location from 'expo-location';

export const setupGeofence = async (contactLocation, radius = 100) => {
  await Location.startGeofencingAsync('CONTACT_GEOFENCE', [
    {
      latitude: contactLocation.latitude,
      longitude: contactLocation.longitude,
      radius: radius,
    }
  ]);
};

