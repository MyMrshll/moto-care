/**
 * InputField — Reusable styled input sesuai design system
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  suffix?: string;
  helperText?: string;
}

export function InputField({
  label,
  error,
  suffix,
  helperText,
  style,
  ...props
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.labelMd,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: layout.radiusMd,
    paddingHorizontal: spacing.lg,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: colors.inputFocus,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.urgent,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  suffix: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.urgent,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.bodySm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
