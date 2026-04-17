import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { Colors, Fonts, Radii, Spacing } from '../theme';

export default function LibraryScreen() {
  const router = useRouter();
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.12:5000";

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadSightings = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) return;

          const res = await axios.get(`${BASE_URL}/sightings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (isActive) {
            setSightings(res.data);
          }
        } catch (err) {
          console.log("LIBRARY ERROR:", err.message);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadSightings();
      return () => { isActive = false; };
    }, [])
  );

  const leftCol = sightings.filter((_, i) => i % 2 === 0);
  const rightCol = sightings.filter((_, i) => i % 2 !== 0);
  
  const heights = [250, 200, 220, 260, 210, 230]; 

  const renderCard = (bird, indexInFull) => {
    const isRealSighting = !!bird.imageUrl && typeof bird.imageUrl === 'string' && bird.imageUrl.startsWith('/');
    const height = heights[indexInFull % heights.length] || 100;
    const fullImageUrl = isRealSighting ? `${BASE_URL}${bird.imageUrl}` : bird.image;

    return (
      <TouchableOpacity 
        key={bird.id} 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/bird-detail', params: { id: bird.id } })}
      >
        <LinearGradient
          colors={[(bird.color || '#88aa66'), `${(bird.color || '#88aa66')}88`, '#0A1208']}
          style={[styles.cardImageArea, { height: height - 44 }]}
        >
          {isRealSighting ? (
            <Image 
              source={{ uri: fullImageUrl }} 
              style={{ width: '100%', height: '100%' }} 
              resizeMode="cover" 
            />
          ) : (
            <BirdSilhouette bird={bird} size={height * 0.6} opacity={0.85} />
          )}
        </LinearGradient>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{bird.name || bird.species}</Text>
          <View style={{ marginTop: 4 }}>
            <RarityTag rarity={bird.rarity || 'Common'} />
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
             <ActivityIndicator color={Colors.sage} style={{ marginTop: 40 }} />
          ) : sightings.length === 0 ? (
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
    padding: Spacing.md,
    marginTop: Spacing.sm
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