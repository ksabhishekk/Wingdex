import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import DexButton from '../components/DexButton';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { BIRDS } from '../data/birds';
import { Colors, Fonts, Radii, Spacing } from '../theme';

export default function ProfileScreen() {
  const router = useRouter();
  
  const commonCount = BIRDS.filter(b => b.rarity === 'common').length;
  const uncommonCount = BIRDS.filter(b => b.rarity === 'uncommon').length;
  const rareCount = BIRDS.filter(b => b.rarity === 'rare').length;
  
  const recentFinds = BIRDS.slice(0, 3);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out my WingDex! I have discovered 6 bird species so far.',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerBtn}>◀ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerBtn}>⚙</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBg}>
          <LinearGradient colors={['#1A2E1A', '#0F200F']} style={StyleSheet.absoluteFill} />
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={[styles.gridLine, { top: 10 + i * 15 }]} />
          ))}
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Svg width="50" height="50" viewBox="0 0 24 24">
              <Circle cx="12" cy="8" r="4" fill="rgba(140,180,100,0.5)" />
              <Ellipse cx="12" cy="19" rx="7" ry="5" fill="rgba(140,180,100,0.5)" />
            </Svg>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.username}>TRAINER_07</Text>
          <Text style={styles.speciesCount}>
            Species Discovered: <Text style={{ color: Colors.sage }}>6</Text>
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: Colors.common }]}>{commonCount}</Text>
              <Text style={styles.statLabel}>CMN</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: Colors.uncommon }]}>{uncommonCount}</Text>
              <Text style={styles.statLabel}>UCM</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: Colors.rare }]}>{rareCount}</Text>
              <Text style={styles.statLabel}>RARE</Text>
            </View>
          </View>

          <View style={styles.recentHeader}>
            <Text style={styles.recentLabel}>RECENT FINDS</Text>
            <TouchableOpacity onPress={() => router.push('/library')}>
              <Text style={styles.viewAllBtn}>VIEW ALL ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentRow}>
            {recentFinds.map(bird => (
              <TouchableOpacity 
                key={bird.id} 
                style={styles.recentCard}
                onPress={() => router.push({ pathname: '/bird-detail', params: { id: bird.id } })}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[bird.color, `${bird.color}88`, '#0A1208']} style={styles.recentImageArea}>
                  <BirdSilhouette bird={bird} size={52} />
                </LinearGradient>
                <View style={styles.recentBody}>
                  <Text style={styles.recentName} numberOfLines={1}>{bird.name}</Text>
                  <View style={{ marginTop: 4 }}>
                    <RarityTag rarity={bird.rarity} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <DexButton 
            label="SHARE YOUR PROFILE" 
            variant="outline" 
            onPress={handleShare} 
            fullWidth 
            style={{ marginTop: Spacing.xl }}
          />

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    zIndex: 20
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
  heroBg: {
    height: 118,
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(90,120,60,0.07)'
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -46,
    zIndex: 10
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.forestMid,
    borderWidth: 3,
    borderColor: Colors.dexRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dexRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8
  },
  infoSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: 12
  },
  username: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: Colors.cream,
    textAlign: 'center',
    marginBottom: 6
  },
  speciesCount: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.mutedGreen,
    textAlign: 'center',
    marginBottom: 20
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(26,46,26,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.2)',
    borderRadius: Radii.md,
    paddingVertical: 13,
    alignItems: 'center'
  },
  statValue: {
    fontFamily: Fonts.pixel,
    fontSize: 16,
    marginBottom: 6
  },
  statLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 5,
    color: Colors.mutedGreen
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  recentLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.sage
  },
  viewAllBtn: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.mutedGreen
  },
  recentRow: {
    flexDirection: 'row',
    gap: 8
  },
  recentCard: {
    flex: 1,
    backgroundColor: Colors.forestMid,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.15)'
  },
  recentImageArea: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentBody: {
    padding: 6,
    height: 48,
    justifyContent: 'center'
  },
  recentName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 9,
    color: Colors.cream
  }
});
