import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput as RNTextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width, height } = Dimensions.get('window');

// Form values shape
type RegisterValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Validation schema using Yup
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

/**
 * Register Screen for UniReads
 * - Beautiful cinematic UI with background image
 * - Form validation with Formik & Yup
 * - Creates new user account
 */
export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (
    values: RegisterValues,
    setFieldError: (f: string, m: string) => void,
    setSubmitting: (b: boolean) => void
  ) => {
    setSubmitting(true);
    try {
      // Simulate API call for registration
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, we'll just navigate to login
      // In production, you would call your registration API here
      alert('Registration successful! Please login.');
      router.push('/auth/Login');
    } catch (err: any) {
      setFieldError('email', err?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Empty initial values for registration
  const initialValues: RegisterValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  return (
    <ImageBackground
      source={require('@/assets/images/login5.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover">
      {/* Dark Overlay for better text visibility */}
      <View style={styles.overlay} />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          {/* Cinematic Header with Blur Effect */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.iconCircle}>
                <IconSymbol name="person.badge.plus.fill" size={52} color="#fff" />
              </View>
              <Text style={styles.appName}>Join UniReads</Text>
              <Text style={styles.tagline}>Start Your Learning Journey Today</Text>
              <View style={styles.decorativeLine} />
            </View>
          </View>

          {/* Register Form Card with Blur */}
          <BlurView intensity={80} tint="dark" style={styles.formCard}>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>

            <Formik
              initialValues={initialValues}
              validationSchema={RegisterSchema}
              onSubmit={(values, { setFieldError, setSubmitting }) =>
                handleSubmit(values, setFieldError, setSubmitting)
              }>
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <View style={styles.form}>
                  {/* Username Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <IconSymbol name="person.fill" size={20} color="#6b7280" style={styles.inputIcon} />
                      <RNTextInput
                        placeholder="Username"
                        autoCapitalize="none"
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                        onChangeText={handleChange('username')}
                        onBlur={handleBlur('username')}
                        value={values.username}
                      />
                    </View>
                    {touched.username && errors.username ? (
                      <View style={styles.errorContainer}>
                        <IconSymbol name="exclamationmark.circle" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{errors.username}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <IconSymbol name="envelope.fill" size={20} color="#6b7280" style={styles.inputIcon} />
                      <RNTextInput
                        placeholder="Email Address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                      />
                    </View>
                    {touched.email && errors.email ? (
                      <View style={styles.errorContainer}>
                        <IconSymbol name="exclamationmark.circle" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{errors.email}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <IconSymbol name="lock.fill" size={20} color="#6b7280" style={styles.inputIcon} />
                      <RNTextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <IconSymbol
                          name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                          size={20}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password ? (
                      <View style={styles.errorContainer}>
                        <IconSymbol name="exclamationmark.circle" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{errors.password}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <IconSymbol name="lock.fill" size={20} color="#6b7280" style={styles.inputIcon} />
                      <RNTextInput
                        placeholder="Confirm Password"
                        secureTextEntry={!showConfirmPassword}
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        value={values.confirmPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}>
                        <IconSymbol
                          name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                          size={20}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && errors.confirmPassword ? (
                      <View style={styles.errorContainer}>
                        <IconSymbol name="exclamationmark.circle" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Terms & Conditions Info */}
                  <View style={styles.termsInfo}>
                    <IconSymbol name="checkmark.shield.fill" size={16} color="#10b981" />
                    <Text style={styles.termsText}>
                      By signing up, you agree to our{' '}
                      <Text style={styles.termsLink}>Terms & Conditions</Text>
                    </Text>
                  </View>

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    style={[styles.signupButton, isSubmitting && styles.signupButtonDisabled]}>
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.signupGradient}>
                        <Text style={styles.signupButtonText}>Sign Up</Text>
                        <IconSymbol name="arrow.right" size={20} color="#fff" />
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            {/* Footer Text */}
            <TouchableOpacity onPress={() => router.push('/auth/Login')}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.loginLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: '#10b981',
    borderRadius: 2,
    marginTop: 8,
  },
  formCard: {
    margin: 24,
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 15,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.9,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
    gap: 6,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  termsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  termsText: {
    fontSize: 12,
    color: '#fff',
    flex: 1,
    fontWeight: '500',
  },
  termsLink: {
    fontWeight: '800',
    color: '#10b981',
    textDecorationLine: 'underline',
  },
  signupButton: {
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  signupButtonDisabled: {
    opacity: 0.5,
  },
  signupGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    fontWeight: '500',
  },
  loginLink: {
    color: '#10b981',
    fontWeight: '800',
  },
});
