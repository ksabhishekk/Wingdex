import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Polyline } from 'react-native-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DexButton from '../components/DexButton';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { Colors, Fonts, Spacing } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

export default function AiResultScreen() {
  const router = useRouter();
  const { id, species, confidence, imageUrl, lore, diet, flight, habitat, latitude, longitude } = useLocalSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.12:5000";
  const confVal = parseFloat(confidence) || 0;
  const fullImageUrl = imageUrl ? `${BASE_URL}${imageUrl}` : null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const addToWingDex = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(`${BASE_URL}/sightings`, 
        { 
          species, 
          confidence: confVal, 
          imageUrl,
          lore,
          diet,
          flight,
          habitat,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/home");
      }, 3000);
    } catch (err) {
      console.log("Failed to save to WingDex", err);
      Alert.alert("Error", "Could not save sighting to WingDex.");
    }
  };
  
  if (showSuccess) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.successOverlay]}>
        <LinearGradient colors={['#1a3a1a', '#0d1f0d']} style={StyleSheet.absoluteFill} />
        <Text style={styles.successText}>SUCCESS!</Text>
        <Text style={styles.successSubtext}>{species} added to your WingDex.</Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>

          <View style={styles.heroSection}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              {fullImageUrl ? (
                <Image 
                  source={{ uri: fullImageUrl }} 
                  style={{ width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: Colors.sage }} 
                  resizeMode="cover" 
                />
              ) : (
                <BirdSilhouette bird={{ color: "#88aa66" }} size={150} />
              )}
            </Animated.View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.birdName}>{species}</Text>
            <Text style={{ color: "gray" }}>
              Confidence: {confVal.toFixed(1)}%
            </Text>

            <DexButton
              label="ADD TO WINGDEX"
              variant="primary"
              onPress={addToWingDex}
              style={{ marginBottom: Spacing.md }}
            />

            <DexButton
              label="TAKE IMAGE AGAIN"
              variant="outline"
              onPress={() => router.push("/camera")}
              style={{ marginBottom: Spacing.md }}
            />

            <DexButton
              label="CANCEL"
              variant="outline"
              onPress={() => router.push("/home")}
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center'
  },

  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#8FAF7A'
  },

  confSection: {
    padding: 16
  },

  confLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: '#aaa'
  },

  confValue: {
    fontFamily: Fonts.pixel,
    fontSize: 14,
    color: Colors.sage
  },

  detailsSection: {
    padding: 16
  },

  birdName: {
    fontSize: 18,
    color: 'white'
  },

  successOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  
  successText: {
    fontFamily: Fonts.pixel,
    fontSize: 24,
    color: Colors.sage,
    marginBottom: 20
  },

  successSubtext: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.cream
  }
});