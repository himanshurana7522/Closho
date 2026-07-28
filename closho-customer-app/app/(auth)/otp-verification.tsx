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

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

type OtpForm = z.infer<typeof otpSchema>;

export default function OtpVerificationScreen() {
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

  const { control, handleSubmit, formState: { errors } } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (data.otp === '123456') {
        showSnackbar('OTP Verified successfully', 'success');
        router.push('/(auth)/reset-password');
      } else {
        showSnackbar('Invalid OTP. Please try again.', 'error');
      }
    } catch (e) {
      showSnackbar('Verification failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <Button 
              variant="text" 
              title="Back" 
              style={styles.backBtn}
              onPress={() => router.back()}
            />
            <Text style={styles.title}>Verify Code</Text>
            <Text style={styles.subtitle}>Enter the 6-digit verification code sent to your email.</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="OTP Code"
                  placeholder="000000"
                  keyboardType="numeric"
                  maxLength={6}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.otp?.message}
                  style={styles.otpInput}
                />
              )}
            />

            <Button 
              title="Verify Code" 
              onPress={handleSubmit(onSubmit)} 
              isLoading={isLoading} 
              style={styles.verifyBtn}
            />
            
            <Button 
              variant="text"
              title="Resend OTP"
              style={styles.resendBtn}
              onPress={() => showSnackbar('New OTP sent to email', 'info')}
            />
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
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
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
  otpInput: {
    // In a real app, you might use a dedicated OTP input component
    // that splits the 6 digits into separate boxes.
  },
  verifyBtn: {
    marginTop: spacing.md,
  },
  resendBtn: {
    marginTop: spacing.lg,
  },
});
