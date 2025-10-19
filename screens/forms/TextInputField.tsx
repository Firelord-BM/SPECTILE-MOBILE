import { theme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface TextInputFieldProps extends TextInputProps {
  label: string;
  isRequired?: boolean;
  error?: string;
}

export function TextInputField({
  label,
  isRequired = false,
  error,
  style,
  ...props
}: TextInputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.colors.textLight}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.danger,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    minHeight: 48,
  },
  inputError: {
    borderColor: theme.colors.danger,
    borderWidth: 1.5,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
});