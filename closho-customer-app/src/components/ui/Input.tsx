import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  TextInputProps
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input = ({ label, error, isPassword, style, onFocus, onBlur, ...rest }: InputProps) => {
  const [isSecure, setIsSecure] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onBlur) onBlur(e);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.status.error : colors.border, error ? colors.status.error : colors.primary]
  });

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, error && styles.labelError]}>{label}</Text>}
      
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setIsSecure(!isSecure)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isSecure ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Animated.Text style={styles.errorText}>
          {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelError: {
    color: colors.status.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    paddingHorizontal: spacing.md,
    height: '100%',
  },
  eyeIcon: {
    paddingHorizontal: spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: 4,
  }
});
