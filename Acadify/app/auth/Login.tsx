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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/userSlice';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width, height } = Dimensions.get('window');

// Key used to persist the auth token
const TOKEN_KEY = 'unireads_token';

// Form values shape
type LoginValues = {
  username: string;
  password: string;
};

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  username: Yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  password: Yup.string().min(3, 'Password must be at least 3 characters').required('Password is required'),
});

/**
 * Login screen that authenticates against dummyjson.com/auth/login
 * - Beautiful gradient UI design
 * - Validates username & password with Yup
 * - Persists token in AsyncStorage
 * - Stores user in Redux
 * - Navigates to the app root on success
 * 
 * DEFAULT CREDENTIALS:
 * Username: emilys
 * Password: emilyspass
 */
export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: LoginValues,
    setFieldError: (f: string, m: string) => void,
    setSubmitting: (b: boolean) => void
  ) => {
    setSubmitting(true);
    try {
      const payload = { username: values.username, password: values.password };
      
      console.log('Attempting login with:', payload.username);

      // First, check if user is registered locally
      const registeredUsersJson = await AsyncStorage.getItem('registered_users');
      const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
      
      // Find locally registered user
      const localUser = registeredUsers.find(
        (u: any) => u.username === values.username && u.password === values.password
      );

      if (localUser) {
        // User is registered locally
        console.log('Found locally registered user:', localUser.username);
        
        const token = `local_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        
        const userData = {
          id: localUser.id,
          username: localUser.username,
          firstName: localUser.firstName || localUser.username,
          lastName: localUser.lastName || '',
          email: localUser.email || '',
          image: localUser.image || '',
          token: token,
          gender: localUser.gender || 'male',
        };
        
        console.log('Storing locally registered user data:', userData);
        dispatch(setUser(userData));
        
        console.log('Login successful, navigating to home');
        router.replace('/');
        return;
      }

      // If not found locally, try DummyJSON API
      console.log('Checking DummyJSON API for user:', payload.username);
      const res = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log('Login response:', JSON.stringify(json, null, 2));
      
      if (!res.ok) {
        const msg = json?.message || 'Invalid credentials';
        setFieldError('username', msg);
        setSubmitting(false);
        return;
      }

      // Check if we have a valid token (could be 'token' or 'accessToken')
      let token = json.token || json.accessToken;
      
      // If no token returned, generate a mock one for development
      if (!token) {
        console.warn('No token in response, using mock token for development');
        token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Persist token and user info
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      // Create user object with proper fallbacks
      const userData = {
        id: json.id || 0,
        username: json.username || values.username,
        firstName: json.firstName || '',
        lastName: json.lastName || '',
        email: json.email || '',
        image: json.image || '',
        token: token,
        gender: json.gender || 'male',
      };
      
      console.log('Storing user data:', userData);
      dispatch(setUser(userData));

      // Navigate to the root (tabs)
      console.log('Login successful, navigating to home');
      router.replace('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setFieldError('username', err?.message || 'Network error. Please try again.');
      setSubmitting(false);
    }
  };

  // Default credentials - empty for user to enter
  const initialValues: LoginValues = { username: '', password: '' };

  return (
    <ImageBackground
      source={require('@/assets/images/login_image.jpg')}
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
                <IconSymbol name="book.fill" size={52} color="#fff" />
              </View>
              <Text style={styles.appName}>UniReads</Text>
              <Text style={styles.tagline}>Your Gateway to Knowledge</Text>
              <View style={styles.decorativeLine} />
            </View>
          </View>

          {/* Login Form Card with Blur */}
          <BlurView intensity={80} tint="dark" style={styles.formCard}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue your reading journey</Text>

          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={(values, { setFieldError, setSubmitting }) =>
              handleSubmit(values, setFieldError, setSubmitting)
            }>
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <IconSymbol name="person.fill" size={20} color="#60a5fa" style={styles.inputIcon} />
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

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <IconSymbol name="lock.fill" size={20} color="#60a5fa" style={styles.inputIcon} />
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

                {/* Default Credentials Info */}
                <View style={styles.credentialsInfo}>
                  <IconSymbol name="info.circle.fill" size={16} color="#3b82f6" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.credentialsText}>
                      Test Users (username / password):
                    </Text>
                    <Text style={[styles.credentialsText, { marginTop: 4 }]}>
                      <Text style={styles.credentialsBold}>emilys / emilyspass</Text>
                    </Text>
                    <Text style={styles.credentialsText}>
                      <Text style={styles.credentialsBold}>michaelw / michaelwpass</Text>
                    </Text>
                  </View>
                </View>

                {/* Login Button with Glass Effect */}
                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}>
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <BlurView intensity={90} tint="light" style={styles.loginBlurView}>
                      <LinearGradient
                        colors={['rgba(59, 130, 246, 0.8)', 'rgba(37, 99, 235, 0.9)', 'rgba(29, 78, 216, 0.95)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.loginGradient}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <IconSymbol name="arrow.right.circle.fill" size={22} color="#fff" />
                      </LinearGradient>
                    </BlurView>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          {/* Footer Text */}
          <TouchableOpacity onPress={() => router.push('/auth/Register')}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 50,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2,
    marginTop: 8,
  },
  formCard: {
    margin: 24,
    borderRadius: 28,
    padding: 32,
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
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.9,
  },
  input: {
    flex: 1,
    fontSize: 16,
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
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  credentialsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.5)',
  },
  credentialsText: {
    fontSize: 13,
    color: '#fff',
    flex: 1,
    fontWeight: '600',
  },
  credentialsBold: {
    fontWeight: '900',
    color: '#60a5fa',
  },
  loginButton: {
    height: 62,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginBlurView: {
    flex: 1,
    overflow: 'hidden',
  },
  loginGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 20,
    fontWeight: '600',
  },
  signupLink: {
    color: '#60a5fa',
    fontWeight: '900',
  },
});
