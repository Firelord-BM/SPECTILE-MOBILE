import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

const handleLogout = async () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
        style: 'destructive',
      },
    ]
  );
};