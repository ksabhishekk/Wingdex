import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import DexButton from '../components/DexButton';
import { Colors, Fonts } from '../theme';

// Generate stars
const STARS = Array.from({ length: 24 }).map((_, i) => ({
  top: `${(i * 13) % 100}%`,
  left: `${(i * 29) % 100}%`,
  size: 1.5 + (i % 2),
  opacity: 0.2 + (i % 5) * 0.1
}));

export default function LandingScreen() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        delay: 400,
        useNativeDriver: true
      })
    ];

    Animated.parallel(animations).start();

    // cleanup (important for navigation back/forth)
    return () => {
      logoOpacity.stopAnimation();
      logoTranslateY.stopAnimation();
      buttonOpacity.stopAnimation();
    };
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>

      {/* BACKGROUND */}
      <LinearGradient
        colors={['#060E06', '#0F220F', '#1A3A0E', '#080F08']}
        locations={[0, 0.25, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* STARS */}
      {STARS.map((star, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity
            }
          ]}
        />
      ))}

      {/* MAIN CONTENT */}
      <View style={styles.content}>

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }]
            }
          ]}
        >
          <Svg width="80" height="80" viewBox="0 0 80 80">
            <Circle
              cx="40"
              cy="40"
              r="38"
              fill="transparent"
              stroke={Colors.sage}
              strokeWidth="2"
            />
            <Path
              d="M40 20 Q60 40 40 60 Q20 40 40 20"
              fill={Colors.moss}
              opacity="0.8"
            />
            <Path
              d="M40 20 L40 60 L60 40 Z"
              fill={Colors.sage}
              opacity="0.6"
            />
          </Svg>

          <Text style={styles.title}>WINGDEX</Text>
          <Text style={styles.subtitle}>// BIRD DISCOVERY //</Text>
        </Animated.View>

        {/* BUTTON */}
        <Animated.View
          style={{
            opacity: buttonOpacity,
            width: '100%',
            paddingHorizontal: 40
          }}
        >
          <DexButton
            label="GET STARTED"
            variant="primary"
            onPress={() => router.push('/login')}
            fullWidth
          />
        </Animated.View>

      </View>

      {/* FOREST */}
      <View style={styles.forestContainer}>
        <Svg width="100%" height="120" viewBox="0 0 400 120">
          <Path
            d="M0 120 L0 60 Q50 30 100 70 T200 40 T300 80 T400 50 L400 120 Z"
            fill="#0A1208"
          />
          <Path
            d="M0 120 L0 80 Q60 60 120 90 T240 50 T360 80 T400 60 L400 120 Z"
            fill="#0D1A0D"
          />
        </Svg>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: '#E0FFE0',
    borderRadius: 99
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 60
  },

  title: {
    fontFamily: Fonts.pixel,
    fontSize: 22,
    color: Colors.cream,
    letterSpacing: 3,
    marginTop: 20
  },

  subtitle: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.sage,
    letterSpacing: 3,
    marginTop: 12
  },

  forestContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1
  }
});