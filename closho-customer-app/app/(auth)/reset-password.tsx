import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from '../../src/components/ui/SnackbarContext';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSnackbar('Password reset successful', 'success');
      router.replaceAll('/(auth)/login');
    } catch (e) {
      showSnackbar('Failed to reset password. Try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your new password below</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="New Password" placeholder="Enter new password" isPassword onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message} />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Confirm Password" placeholder="Confirm new password" isPassword onBlur={onBlur} onChangeText={onChange} value={value} error={errors.confirmPassword?.message} />
              )}
            />

            <Button title="Update Password" onPress={handleSubmit(onSubmit)} isLoading={isLoading} style={styles.btn} />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: spacing.xl,
  },
  resetBtn: {
    marginTop: spacing.md,
  },
});
