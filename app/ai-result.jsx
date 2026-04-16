import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Polyline } from 'react-native-svg';
import DexButton from '../components/DexButton';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { BIRDS } from '../data/birds';
import { Colors, Fonts, Radii, Spacing } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

export default function AiResultScreen() {
  const router = useRouter();
  const { id, confidence, alreadyCollected } = useLocalSearchParams();
  
  const bird = BIRDS.find(b => b.id === id) || BIRDS[0];
  const confVal = parseFloat(confidence) || 95.0;
  const isCollected = alreadyCollected === '1';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;
  const confAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(lineAnim, {
        toValue: 220,
        duration: 850,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true
      })
    ]).start(() => {
      Animated.timing(confAnim, {
        toValue: (confVal / 100) * (screenWidth - Spacing.md * 2),
        duration: 800,
        useNativeDriver: false
      }).start();
    });
  }, [confVal]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.headerBtn}>◀ BACK</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SCAN RESULT</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.heroSection}>
            <LinearGradient 
              colors={[bird.color, `${bird.color}BB`, Colors.screenBg]} 
              style={StyleSheet.absoluteFill} 
            />
            {isCollected && <View style={styles.collectedOverlay} />}
            
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              <BirdSilhouette bird={bird} size={150} opacity={isCollected ? 0.5 : 0.78} />
            </Animated.View>
            
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: lineAnim }] }]} />
          </View>

          <View style={styles.confSection}>
            <View style={styles.confRow}>
              <Text style={styles.confLabel}>MATCH CONFIDENCE</Text>
              <Text style={styles.confValue}>{confVal.toFixed(1)}%</Text>
            </View>
            <View style={styles.trackBar}>
              <Animated.View style={[styles.fillBar, { width: confAnim }]} />
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.birdName}>{bird.name}</Text>
                <Text style={styles.scientific}>{bird.scientificName}</Text>
              </View>
              <RarityTag rarity={bird.rarity} size="md" />
            </View>

            <View style={styles.descBox}>
              <Text style={styles.descText} numberOfLines={3}>{bird.description}</Text>
            </View>

            {isCollected ? (
              <>
                <View style={styles.badgeRow}>
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={Colors.sage} strokeWidth="3">
                    <Polyline points="20 6 9 17 4 12" />
                  </Svg>
                  <Text style={styles.badgeText}>ALREADY IN YOUR WINGDEX</Text>
                </View>
                <Text style={styles.noteText}>First discovered {bird.discovered}. Already logged in your collection.</Text>
                
                <DexButton 
                  label="VIEW IN WINGDEX" 
                  variant="outline" 
                  onPress={() => router.push({ pathname: '/bird-detail', params: { id: bird.id } })} 
                  style={{ marginBottom: 12 }}
                />
              </>
            ) : (
              <DexButton 
                label="ADD TO WINGDEX" 
                variant="primary" 
                onPress={() => router.push({ pathname: '/bird-detail', params: { id: bird.id, justAdded: '1' } })} 
                style={{ marginBottom: 16 }}
              />
            )}

            <DexButton 
              label="SCAN AGAIN" 
              variant="ghost" 
              onPress={() => router.replace('/camera')} 
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12
  },
  headerBtn: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.sage
  },
  headerTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: Colors.cream
  },
  heroSection: {
    height: 220,
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  collectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,21,10,0.45)',
    zIndex: 1
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#8FAF7A',
    shadowColor: '#8FAF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10
  },
  confSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: 14
  },
  confRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  confLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.mutedGreen
  },
  confValue: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.sage
  },
  trackBar: {
    height: 5,
    backgroundColor: 'rgba(90,120,60,0.2)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  fillBar: {
    height: 5,
    backgroundColor: Colors.sage,
    borderRadius: 3
  },
  detailsSection: {
    padding: Spacing.md
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md
  },
  birdName: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: Colors.cream,
    lineHeight: 18,
    marginBottom: 4
  },
  scientific: {
    fontFamily: Fonts.body,
    fontStyle: 'italic',
    fontSize: 11,
    color: Colors.mutedGreen
  },
  descBox: {
    backgroundColor: 'rgba(26,46,26,0.5)',
    borderColor: 'rgba(90,120,60,0.2)',
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: 12,
    marginBottom: Spacing.lg
  },
  descText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.cream,
    lineHeight: 14
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  badgeText: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.sage,
    marginLeft: 6
  },
  noteText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.mutedGreen,
    marginBottom: Spacing.lg,
    lineHeight: 14
  }
});
