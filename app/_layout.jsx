import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { 
  useFonts,
  PressStart2P_400Regular
} from '@expo-google-fonts/press-start-2p';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold
} from '@expo-google-fonts/dm-sans';
import {
  DMMono_400Regular,
  DMMono_500Medium
} from '@expo-google-fonts/dm-mono';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMMono_400Regular,
    DMMono_500Medium
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" translucent />
      <Stack screenOptions={{ 
        headerShown: false, 
        contentStyle: { backgroundColor: '#0D1A0D' },
        animation: 'fade'
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ai-result" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="library" />
        <Stack.Screen name="bird-detail" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="heatmap" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}
