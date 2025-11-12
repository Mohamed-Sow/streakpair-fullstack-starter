import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppError, getErrorMessage } from '@/utils/errors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { token: string };
};

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const { token } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement password reset API call
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const appError = error as AppError;
      Alert.alert('Reset Failed', getErrorMessage(appError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0891b2', '#0e7490']} style={styles.gradient}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Set New Password</Text>
              <Text style={styles.subtitle}>
                Enter your new password below
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="New Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your new password"
                secureTextEntry={!showPassword}
                error={errors.password}
                rightIcon={
                  <Text onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                }
              />

              <Input
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your new password"
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                rightIcon={
                  <Text onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showPasswordText}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                }
              />

              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                loading={isLoading}
                size="large"
                style={styles.resetButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f2fe',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  showPasswordText: {
    fontSize: 14,
    color: '#0891b2',
    fontWeight: '500',
  },
  resetButton: {
    marginTop: 16,
  },
});

export default ResetPasswordScreen;