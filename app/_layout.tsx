import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        const inAuthGroup = segments[0] === '(auth)';

        if (!token && !inAuthGroup) {
          router.replace('/(auth)/login');
        } else if (token && inAuthGroup) {
           router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsNavigationReady(true);
      }
    };

    checkAuth();
  }, [segments]);

  return { isNavigationReady };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isNavigationReady } = useProtectedRoute();

  if (!isNavigationReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Auth Routes */}
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          
          {/* Protected Routes */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="contact-form" options={{ headerShown: false }} />
          <Stack.Screen name="contact-detail" options={{ headerShown: false }} />
          <Stack.Screen name="order-form" options={{ headerShown: false }} />
          <Stack.Screen name="activity-form" options={{ headerShown: false }} />
          <Stack.Screen name="register-client" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}