import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import DexButton from '../components/DexButton';
import { Colors, Fonts, Radii, Spacing } from '../theme';

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

  const handleAuth = async () => {
    setAuthError('');
    try {
      if (isLogin) {
        // LOGIN
        const res = await axios.post(`${BASE_URL}/auth/login`, {
          email,
          password,
        });

        const token = res.data.token;
        const fetchedName = res.data.user.name || res.data.user.email.split('@')[0];

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("username", fetchedName);

        router.replace('/home');

      } else {
        // SIGNUP VALIDATION
        if (!email || !password || !username) {
          return setAuthError("All fields are required.");
        }
        if (password.length < 8) {
           return setAuthError("Password must be at least 8 characters long.");
        }
        if (!/[A-Z]/.test(password)) {
           return setAuthError("Password must contain at least one uppercase letter.");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
           return setAuthError("Password must contain at least one special character.");
        }

        // SIGNUP
        await axios.post(`${BASE_URL}/auth/signup`, {
          email,
          password,
          name: username
        });

        setIsLogin(true);
        setAuthError("Account created! Please sign in.");
      }

    } catch (err) {
      console.log(err.response?.data || err.message);
      setAuthError(err.response?.data?.error || "Connection error. Please try again.");
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#060E06', '#1A2E1A', '#060E06']} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll}>
            
            <View style={styles.header}>
              <Text style={styles.title}>WINGDEX</Text>
              <Text style={styles.subtitle}>{isLogin ? '// welcome back //' : '// create account //'}</Text>
            </View>

            <View style={styles.form}>
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>USERNAME</Text>
                  <TextInput 
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="TrainerO7"
                    placeholderTextColor={Colors.dimGreen}
                  />
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput 
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="trainer@wingdex.app"
                  placeholderTextColor={Colors.dimGreen}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <TextInput 
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.dimGreen}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={Colors.sage} />
                  </TouchableOpacity>
                </View>
              </View>

              {!!authError && (
                <Text style={styles.errorText}>{authError}</Text>
              )}

              <DexButton 
                label={isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'} 
                variant="primary" 
                onPress={handleAuth} 
                fullWidth 
                style={{ marginTop: 10 }}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.googleButton} onPress={handleAuth}>
                <Svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                  <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </Svg>
                <Text style={styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleLink}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontFamily: Fonts.pixel,
    fontSize: 16,
    color: Colors.sage,
    textShadowColor: 'rgba(92,122,74,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  subtitle: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.mutedGreen,
    marginTop: 10
  },
  form: {
    width: '100%'
  },
  inputGroup: {
    marginBottom: Spacing.lg
  },
  label: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.sage,
    marginBottom: 6
  },
  input: {
    backgroundColor: 'rgba(26,46,26,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.3)',
    borderRadius: Radii.sm,
    color: Colors.cream,
    fontFamily: Fonts.body,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,46,26,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.3)',
    borderRadius: Radii.sm,
  },
  eyeBtn: {
    paddingHorizontal: Spacing.md
  },
  errorText: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.dexRed,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: Spacing.md,
    marginTop: -8
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(90,120,60,0.3)'
  },
  dividerText: {
    fontFamily: Fonts.body,
    color: Colors.mutedGreen,
    marginHorizontal: 12,
    fontSize: 12
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.4)',
    borderRadius: Radii.sm,
    paddingVertical: 13
  },
  googleText: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.cream,
    fontSize: 13
  },
  toggleLink: {
    marginTop: Spacing.xxl,
    alignItems: 'center'
  },
  toggleText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.sage
  }
});