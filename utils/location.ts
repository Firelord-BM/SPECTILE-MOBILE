import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number|null;
  timestamp: string;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }
  return true;
};

export const getCurrentLocation = async (): Promise<LocationData> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

export const getLocationAddress = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (addresses.length > 0) {
      const address = addresses[0];
      return `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};