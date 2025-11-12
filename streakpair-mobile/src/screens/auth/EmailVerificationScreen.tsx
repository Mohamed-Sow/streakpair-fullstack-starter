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
import Button from '@/components/ui/Button';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { token: string };
};

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

const EmailVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { token } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyEmail = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement email verification API call
      Alert.alert(
        'Email Verified',
        'Your email has been verified successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const appError = error as AppError;
      Alert.alert('Verification Failed', getErrorMessage(appError));
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
              <Text style={styles.icon}>✓</Text>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                Click the button below to verify your email address and complete your registration
              </Text>
            </View>

            <View style={styles.form}>
              <Button
                title="Verify Email"
                onPress={handleVerifyEmail}
                loading={isLoading}
                size="large"
                style={styles.verifyButton}
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
    marginBottom: 48,
  },
  icon: {
    fontSize: 64,
    color: '#ffffff',
    marginBottom: 24,
    fontWeight: 'bold',
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
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  verifyButton: {
    marginBottom: 24,
  },
});

export default EmailVerificationScreen;