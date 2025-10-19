import { ThemedView } from '@/components/themed-view';
import LoginScreen from '@/screens/Auth/Login';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function Login() {
  return (
  <ThemedView style={styles.container}>
<LoginScreen/>
  </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});