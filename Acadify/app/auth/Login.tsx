import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput as RNTextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/userSlice';

// Key used to persist the auth token
const TOKEN_KEY = 'unireads_token';

// Form values shape
type LoginValues = {
  email: string; // We'll send email as the username field to the dummy API per requirement
  password: string;
};

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(3, 'Password is too short').required('Password is required'),
});

/**
 * Login screen that authenticates against dummyjson.com/auth/login
 * - Validates email & password with Yup
 * - Persists token in AsyncStorage
 * - Stores user in Redux
 * - Navigates to the app root on success
 */
export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (
    values: LoginValues,
    setFieldError: (f: string, m: string) => void,
    setSubmitting: (b: boolean) => void
  ) => {
    setSubmitting(true);
    try {
      // NOTE: dummyjson expects a username field; we send the email value as username per project requirement
      const payload = { username: values.email, password: values.password };

      const res = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        // API may return an object with message
        const msg = json?.message || 'Invalid credentials';
        setFieldError('email', msg);
        return;
      }

      // Persist token and user info
      await AsyncStorage.setItem(TOKEN_KEY, json.token);
      dispatch(
        setUser({
          id: json.id,
          username: json.username || values.email,
          token: json.token,
        })
      );

      // Navigate to the root (tabs)
      router.replace('/');
    } catch (err: any) {
      setFieldError('email', err?.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues: LoginValues = { email: 'kminchelle', password: '0lelplR' };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UniReads — Login</Text>

      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={(values, { setFieldError, setSubmitting }) => handleSubmit(values, setFieldError, setSubmitting)}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View>
            <RNTextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

            <RNTextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

            {isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <Button title="Login" onPress={() => handleSubmit()} />
            )}
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 20, marginBottom: 12 },
  error: { color: '#b91c1c', marginBottom: 8 },
});
