import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_BASE_URL = 'https://api.spectile.co.ke/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles: string[];
}

interface LoginResponse {
  token: string;
  tokenType: string;
  user: AuthUser;
}

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const credentials: LoginCredentials = {
        username: username.trim(),
        password: password.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();
      const data: LoginResponse = result.data;

      // Store token and user info
      await AsyncStorage.setItem('@auth_token', data.token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(data.user));

      Alert.alert(
        'Success',
        `Welcome, ${data.user.fullName || data.user.username}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to main app
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.appName}>Spectile CRM</Text>
            <Text style={styles.subtitle}>Sales & Client Management</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoComplete="username"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={loading}
                >
                  <Text style={styles.eyeIconText}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loginButtonContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.loginButtonText}>Signing in...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert('Info', 'Contact admin to reset password')}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 Spectile. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 2,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    paddingRight: 50,
    fontSize: 16,
    color: theme.colors.text,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  eyeIconText: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: theme.spacing.xl * 2,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
});