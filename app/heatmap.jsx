import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Rect, Polygon } from 'react-native-svg';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { BIRDS } from '../data/birds';
import { Colors, Fonts, Radii, Spacing } from '../theme';

const ZONES = [
  { top: '38%', left: '42%', radius: 80, color: '#CC2929', alpha: 0.58 },
  { top: '55%', left: '60%', radius: 58, color: '#F06400', alpha: 0.48 },
  { top: '28%', left: '24%', radius: 46, color: '#FFBE00', alpha: 0.40 },
  { top: '64%', left: '20%', radius: 38, color: '#FFBE00', alpha: 0.33 },
  { top: '32%', left: '74%', radius: 30, color: '#FFDC3C', alpha: 0.26 }
];

export default function HeatmapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const bird = BIRDS.find(b => b.id === id) || BIRDS[0];

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [pulseAnim]);

  // Generate grid line coordinates
  const vLines = Array.from({ length: 15 }).map((_, i) => i * 28);
  const hLines = Array.from({ length: 25 }).map((_, i) => i * 28);

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          {vLines.map(x => (
            <Path key={`v${x}`} d={`M${x} 0 L${x} 1000`} stroke="rgba(60,100,40,0.11)" strokeWidth="1" />
          ))}
          {hLines.map(y => (
            <Path key={`h${y}`} d={`M0 ${y} L1000 ${y}`} stroke="rgba(60,100,40,0.11)" strokeWidth="1" />
          ))}
          <Polygon points="0,150 120,90 250,160 400,100 400,300 0,250" fill="rgba(58,90,42,0.14)" />
          <Polygon points="0,450 150,390 300,480 400,320 400,600 0,600" fill="rgba(42,70,30,0.1)" />
          
          <Path d="M0 350 Q 200 370 400 340" stroke="rgba(100,120,80,0.3)" strokeWidth="3" fill="none" />
          <Path d="M220 0 Q 200 400 180 800" stroke="rgba(100,120,80,0.3)" strokeWidth="3" fill="none" />
        </Svg>

        {ZONES.map((zone, i) => {
          const minOpacity = zone.alpha * 0.7;
          const maxOpacity = zone.alpha * 1.15;
          const opacity = pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [minOpacity, maxOpacity > 1 ? 1 : maxOpacity]
          });
          
          return (
            <Animated.View 
              key={i}
              style={[
                styles.zone,
                { top: zone.top, left: zone.left, width: zone.radius * 2, height: zone.radius * 2 },
                { backgroundColor: zone.color, opacity }
              ]} 
            />
          );
        })}

        <SafeAreaView edges={['top']} style={styles.privacyNoteContainer}>
          <View style={styles.privacyNote}>
            <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={Colors.mutedGreen} strokeWidth="2">
              <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </Svg>
            <Text style={styles.privacyText}>NO EXACT LOCATIONS SHOWN</Text>
          </View>
        </SafeAreaView>

        <View style={styles.legend}>
          <Text style={styles.legendLabel}>SIGHTING DENSITY</Text>
          <View style={styles.gradientBarRow}>
            <View style={[styles.gradientSeg, { backgroundColor: 'rgba(100,200,60,0.4)' }]} />
            <View style={[styles.gradientSeg, { backgroundColor: 'rgba(200,220,0,0.6)' }]} />
            <View style={[styles.gradientSeg, { backgroundColor: 'rgba(255,120,0,0.75)' }]} />
            <View style={[styles.gradientSeg, { backgroundColor: 'rgba(204,41,41,0.9)' }]} />
          </View>
          <View style={styles.legendLabels}>
            <Text style={styles.legendLowHigh}>LOW</Text>
            <Text style={styles.legendLowHigh}>HIGH</Text>
          </View>
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.footerHeader}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backBtn}>◀ BACK</Text>
          </TouchableOpacity>
          <Text style={styles.footerTitle}>RECENT SIGHTINGS</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.birdRow}>
          <LinearGradient 
            colors={[bird.color, `${bird.color}88`]} 
            style={styles.thumbnail}
          >
            <BirdSilhouette bird={bird} size={40} opacity={0.7} />
          </LinearGradient>
          <View style={styles.birdInfo}>
            <Text style={styles.footerBirdName}>{bird.name}</Text>
            <Text style={styles.footerStats}>Last 30 days · 47 public sightings</Text>
          </View>
          <RarityTag rarity={bird.rarity} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1A10'
  },
  mapArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  zone: {
    position: 'absolute',
    borderRadius: 999,
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
  },
  privacyNoteContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,21,10,0.9)',
    borderColor: 'rgba(90,120,60,0.2)',
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6
  },
  privacyText: {
    fontFamily: Fonts.pixel,
    fontSize: 5,
    color: Colors.mutedGreen
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(10,21,10,0.8)',
    padding: 10,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.2)'
  },
  legendLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 5,
    color: Colors.cream,
    marginBottom: 6
  },
  gradientBarRow: {
    flexDirection: 'row',
    height: 8,
    width: 100,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4
  },
  gradientSeg: {
    flex: 1,
    height: '100%'
  },
  legendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  legendLowHigh: {
    fontFamily: Fonts.pixel,
    fontSize: 4,
    color: Colors.mutedGreen
  },
  footer: {
    backgroundColor: 'rgba(13,26,13,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(90,120,60,0.18)'
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14
  },
  backBtn: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.sage
  },
  footerTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: Colors.cream
  },
  birdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
    gap: 10
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center'
  },
  birdInfo: {
    flex: 1
  },
  footerBirdName: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.cream,
    marginBottom: 4
  },
  footerStats: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.mutedGreen
  }
});
