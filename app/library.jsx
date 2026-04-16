import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomNav from '../components/BottomNav';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { BIRDS } from '../data/birds';
import { Colors, Fonts, Radii, Spacing, RARITY_CONFIG } from '../theme';

export default function LibraryScreen() {
  const router = useRouter();

  // Masonry layout splits
  const leftCol = BIRDS.filter((_, i) => i % 2 === 0);
  const rightCol = BIRDS.filter((_, i) => i % 2 !== 0);
  const heights = [100, 84, 84, 100, 90, 96]; // for i: 0..5

  const commonCount = BIRDS.filter(b => b.rarity === 'common').length;
  const uncommonCount = BIRDS.filter(b => b.rarity === 'uncommon').length;
  const rareCount = BIRDS.filter(b => b.rarity === 'rare').length;

  const renderChip = (count, rKey) => {
    const rConfig = RARITY_CONFIG[rKey];
    return (
      <View key={rKey} style={[styles.chip, { borderColor: rConfig.border }]}>
        <Text style={[styles.chipText, { color: rConfig.color }]}>
          ● {count} {rConfig.label}
        </Text>
      </View>
    );
  };

  const renderCard = (bird, indexInFull) => {
    const height = heights[indexInFull] || 100;
    return (
      <TouchableOpacity 
        key={bird.id} 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/bird-detail', params: { id: bird.id } })}
      >
        <LinearGradient
          colors={[bird.color, `${bird.color}88`, '#0A1208']}
          style={[styles.cardImageArea, { height: height - 44 }]}
        >
          <BirdSilhouette bird={bird} size={height * 0.55} opacity={0.85} />
        </LinearGradient>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{bird.name}</Text>
          <View style={{ marginTop: 4 }}>
            <RarityTag rarity={bird.rarity} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>YOUR WINGDEX</Text>
          <Text style={styles.headerSubtitle}>// a growing archive of your discoveries //</Text>
        </View>

        <View style={styles.chipsRow}>
          {renderChip(commonCount, 'common')}
          {renderChip(uncommonCount, 'uncommon')}
          {renderChip(rareCount, 'rare')}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.masonryContainer}>
            <View style={styles.column}>
              {leftCol.map((bird, i) => renderCard(bird, i * 2))}
            </View>
            <View style={styles.column}>
              {rightCol.map((bird, i) => renderCard(bird, i * 2 + 1))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'rgba(13,26,13,0.97)' }}>
        <BottomNav />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 4
  },
  headerTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: Colors.cream,
    marginBottom: 6
  },
  headerSubtitle: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    color: Colors.mutedGreen
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 7,
    marginBottom: 8
  },
  chip: {
    backgroundColor: 'rgba(26,46,26,0.8)',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipText: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    letterSpacing: 0.5
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  column: {
    width: '48%',
    flexDirection: 'column'
  },
  card: {
    backgroundColor: Colors.forestMid,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.15)',
    marginBottom: 14
  },
  cardImageArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBody: {
    padding: 8,
    height: 44,
    justifyContent: 'center'
  },
  cardName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: Colors.cream
  }
});
