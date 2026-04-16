import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Polyline } from 'react-native-svg';
import DexButton from '../components/DexButton';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { Colors, Fonts, Spacing } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

export default function AiResultScreen() {
  const router = useRouter();
  const { id, species, confidence, imageUrl } = useLocalSearchParams();

  const confVal = parseFloat(confidence) || 0;

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
    router.push({
      pathname: "/bird-detail",
      params: {
        id,
        justAdded: "1",
      },
    });
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>

          <View style={styles.heroSection}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              <BirdSilhouette bird={{ color: "#88aa66" }} size={150} />
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
  }
});