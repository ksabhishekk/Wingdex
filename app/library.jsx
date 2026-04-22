import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Network from 'expo-network';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { Colors, Fonts, Radii, Spacing } from '../theme';

export default function LibraryScreen() {
  const router = useRouter();
  const [sightings, setSightings] = useState([]);
  const [offlineSightings, setOfflineSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sortMode, setSortMode] = useState('newest');

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.12:5000";

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const networkState = await Network.getNetworkStateAsync();
      const online = networkState.isConnected && networkState.isInternetReachable;
      setIsOnline(online);

      const queueStr = await AsyncStorage.getItem('@offline_queue');
      const queue = queueStr ? JSON.parse(queueStr) : [];
      setOfflineSightings(queue.map(q => ({ 
        ...q, 
        isOffline: true, 
        name: 'Pending Sync', 
        rarity: 'unknown', 
        color: '#555555' 
      })));

      if (online) {
        const res = await axios.get(`${BASE_URL}/sightings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSightings(res.data);
      }
    } catch (err) {
      console.log("LIBRARY ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSync = async () => {
    if (syncing || offlineSightings.length === 0) return;
    setSyncing(true);

    let currentQueue = [...offlineSightings];
    let remainingQueue = [];
    let syncedCount = 0;

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      try {
        const token = await AsyncStorage.getItem("token");
        const formData = new FormData();
        formData.append('userId', '1');
        
        const response = await fetch(item.uri);
        const blob = await response.blob();
        formData.append('image', blob, 'photo.jpg');

        const analyzeRes = await axios.post(`${BASE_URL}/sightings/analyze`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        await axios.post(`${BASE_URL}/sightings`, {
          species: analyzeRes.data.species,
          confidence: analyzeRes.data.confidence,
          imageUrl: analyzeRes.data.imageUrl,
          lore: analyzeRes.data.lore,
          diet: analyzeRes.data.diet,
          flight: analyzeRes.data.flight,
          habitat: analyzeRes.data.habitat,
          rarity: analyzeRes.data.rarity || 'common',
          latitude: item.latitude,
          longitude: item.longitude
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        syncedCount++;
      } catch (err) {
        console.log("SYNC ERROR on item", item.id, err.message);
        // Remove the extra properties we added when loading the queue
        const originalItem = {
          id: item.id,
          uri: item.uri,
          latitude: item.latitude,
          longitude: item.longitude,
          timestamp: item.timestamp
        };
        remainingQueue.push(originalItem);
      }
    }

    // Only clear the ones that succeeded by saving the remaining queue
    await AsyncStorage.setItem('@offline_queue', JSON.stringify(remainingQueue));
    
    if (syncedCount > 0) {
      Alert.alert("Sync Complete", `Successfully analyzed and synced ${syncedCount} sighting(s).`);
    }
    
    setSyncing(false);
    fetchData(); 
  };

  const sortedSightings = [...sightings].sort((a, b) => {
    if (sortMode === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortMode === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
    if (sortMode === 'rarest' || sortMode === 'common') {
      const rarityVal = (r) => {
        if (r === 'rare') return 3;
        if (r === 'uncommon') return 2;
        return 1;
      };
      const diff = rarityVal(b.rarity) - rarityVal(a.rarity);
      return sortMode === 'rarest' ? diff : -diff;
    }
    return 0;
  });

  const allSightings = [...offlineSightings, ...sortedSightings];
  const leftCol = allSightings.filter((_, i) => i % 2 === 0);
  const rightCol = allSightings.filter((_, i) => i % 2 !== 0);
  
  const heights = [250, 200, 220, 260, 210, 230]; 

  const renderCard = (bird, indexInFull) => {
    const isOffline = bird.isOffline;
    const isRealSighting = !!bird.imageUrl && typeof bird.imageUrl === 'string' && bird.imageUrl.startsWith('/');
    const height = heights[indexInFull % heights.length] || 100;
    const fullImageUrl = isRealSighting ? `${BASE_URL}${bird.imageUrl}` : bird.image;

    const displayImage = isOffline ? { uri: bird.uri } : (isRealSighting ? { uri: fullImageUrl } : null);

    return (
      <TouchableOpacity 
        key={bird.id} 
        style={[styles.card, isOffline && styles.offlineCard]}
        activeOpacity={0.8}
        disabled={isOffline}
        onPress={() => !isOffline && router.push({ pathname: '/bird-detail', params: { id: bird.id } })}
      >
        <LinearGradient
          colors={[(bird.color || '#88aa66'), `${(bird.color || '#88aa66')}88`, '#0A1208']}
          style={[styles.cardImageArea, { height: height - 44 }]}
        >
          {displayImage ? (
            <>
              <Image 
                source={displayImage} 
                style={{ width: '100%', height: '100%' }} 
                resizeMode="cover" 
              />
              {isOffline && <View style={styles.offlineImageOverlay} />}
            </>
          ) : (
            <BirdSilhouette bird={bird} size={height * 0.6} opacity={0.85} />
          )}
          {isOffline && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>PENDING</Text>
            </View>
          )}
        </LinearGradient>
        <View style={styles.cardBody}>
          <Text style={[styles.cardName, isOffline && { color: '#aaa' }]} numberOfLines={1}>
            {bird.name || bird.species}
          </Text>
          <View style={{ marginTop: 4 }}>
            {!isOffline && <RarityTag rarity={bird.rarity || 'common'} />}
            {isOffline && <Text style={{ fontFamily: Fonts.pixel, fontSize: 6, color: '#666' }}>Awaiting Sync</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Text style={styles.title}>YOUR WINGDEX</Text>

        {isOnline && offlineSightings.length > 0 && (
          <TouchableOpacity 
            style={styles.syncBtn} 
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color={Colors.sage} size="small" />
            ) : (
              <Text style={styles.syncBtnText}>SYNC {offlineSightings.length} OFFLINE SIGHTING(S)</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.sortContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
             {['newest', 'oldest', 'rarest', 'common'].map(mode => (
               <TouchableOpacity 
                 key={mode} 
                 style={[styles.sortChip, sortMode === mode && styles.sortChipActive]}
                 onPress={() => setSortMode(mode)}
               >
                 <Text style={[styles.sortText, sortMode === mode && styles.sortTextActive]}>
                   {mode.toUpperCase()}
                 </Text>
               </TouchableOpacity>
             ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
             <ActivityIndicator color={Colors.sage} style={{ marginTop: 40 }} />
          ) : allSightings.length === 0 ? (
             <View style={{ padding: 40, alignItems: 'center', marginTop: 40 }}>
               <Text style={{ color: Colors.sage, fontFamily: Fonts.bodyMedium, textAlign: 'center', fontSize: 16 }}>
                 Your WingDex is currently empty!
               </Text>
             </View>
          ) : (
            <View style={styles.masonryContainer}>
              <View style={styles.column}>
                {leftCol.map((bird, i) => renderCard(bird, i * 2))}
              </View>
              <View style={styles.column}>
                {rightCol.map((bird, i) => renderCard(bird, i * 2 + 1))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'rgba(13,26,13,0.97)' }}>
        <BottomNav />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.pixel,
    color: Colors.cream,
    fontSize: 18,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm
  },
  syncBtn: {
    backgroundColor: 'rgba(90,120,60,0.2)',
    borderWidth: 1,
    borderColor: Colors.sage,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40
  },
  syncBtnText: {
    fontFamily: Fonts.pixel,
    color: Colors.sage,
    fontSize: 10
  },
  sortContainer: {
    marginBottom: Spacing.md
  },
  sortScroll: {
    paddingHorizontal: Spacing.md
  },
  sortChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(20,35,16,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.3)',
    marginRight: 8
  },
  sortChipActive: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage
  },
  sortText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.mutedGreen
  },
  sortTextActive: {
    color: '#0A1208'
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
    zIndex: 1
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
  offlineCard: {
    borderColor: 'rgba(100,100,100,0.5)',
    borderStyle: 'dashed'
  },
  offlineImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  offlineBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(20,20,20,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#666'
  },
  offlineBadgeText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: '#ccc',
    letterSpacing: 1
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