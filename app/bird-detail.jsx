import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import DexButton from '../components/DexButton';
import { BIRDS } from '../data/birds';
import { Colors, Fonts, Radii, Spacing } from '../theme';

export default function BirdDetailScreen() {
  const router = useRouter();
  const { id, justAdded } = useLocalSearchParams();
  
  const bird = BIRDS.find(b => b.id === id) || BIRDS[0];

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />
      
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <LinearGradient 
            colors={[bird.color, `${bird.color}CC`, Colors.screenBg]} 
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill} 
          />
          
          <SafeAreaView edges={['top']} style={styles.navRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backBtn}>◀ BACK</Text>
            </TouchableOpacity>
            {justAdded === '1' && (
              <View style={styles.addedBadge}>
                <Text style={styles.addedText}>✓ ADDED</Text>
              </View>
            )}
          </SafeAreaView>

          <View style={styles.silhouetteWrapper}>
            <BirdSilhouette bird={bird} size={196} opacity={0.8} />
          </View>
          
          <View style={styles.rarityContainer}>
            <RarityTag rarity={bird.rarity} size="md" />
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.birdName}>{bird.name}</Text>
          <Text style={styles.scientific}>{bird.scientificName}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <Text style={styles.descText}>{bird.description}</Text>

          <Text style={styles.sectionLabel}>HABITAT</Text>
          <View style={styles.habitatRow}>
            {bird.habitat.map((hab, i) => (
              <View key={i} style={styles.habitatChip}>
                <Text style={styles.habitatText}>{hab}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>FIRST DISCOVERED</Text>
          <Text style={styles.dateText}>{bird.discovered}</Text>

          <View style={styles.actionsContainer}>
            <DexButton 
              label="VIEW RECENT SIGHTINGS" 
              variant="primary" 
              onPress={() => router.push({ pathname: '/heatmap', params: { id: bird.id } })} 
              fullWidth 
              style={{ marginBottom: Spacing.md }}
            />
            <DexButton 
              label="BACK TO LIBRARY" 
              variant="outline" 
              onPress={() => router.push('/library')} 
              fullWidth 
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    height: 270,
    width: '100%',
    overflow: 'hidden'
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm
  },
  backBtn: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.sage
  },
  addedBadge: {
    backgroundColor: Colors.dexRed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm
  },
  addedText: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.cream
  },
  silhouetteWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  rarityContainer: {
    position: 'absolute',
    top: 56,
    right: Spacing.md
  },
  contentSection: {
    padding: Spacing.md,
    paddingTop: 18
  },
  birdName: {
    fontFamily: Fonts.pixel,
    fontSize: 13,
    color: Colors.cream,
    letterSpacing: 0.5,
    marginBottom: 6
  },
  scientific: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.mutedGreen,
    fontStyle: 'italic',
    marginBottom: Spacing.md
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(90,120,60,0.18)',
    marginBottom: Spacing.md
  },
  sectionLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.sage,
    opacity: 0.75,
    letterSpacing: 1.5,
    marginBottom: 8
  },
  descText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: 'rgba(245,239,224,0.75)',
    lineHeight: 20,
    marginBottom: Spacing.lg
  },
  habitatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: Spacing.lg
  },
  habitatChip: {
    backgroundColor: 'rgba(26,46,26,0.8)',
    borderColor: 'rgba(90,120,60,0.25)',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  habitatText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.sage
  },
  dateText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.sage,
    marginBottom: Spacing.xxl
  },
  actionsContainer: {
    marginTop: Spacing.md
  }
});
