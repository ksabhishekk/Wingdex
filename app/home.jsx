import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import BottomNav from '../components/BottomNav';
import BirdSilhouette from '../components/BirdSilhouette';
import RarityTag from '../components/RarityTag';
import { BIRDS } from '../data/birds';
import { Colors, Fonts, Radii, Spacing } from '../theme';

export default function HomeScreen() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('TRAINER_07');

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.12:5000";

  useFocusEffect(
    useCallback(() => {
      const fetchSightings = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const cachedName = await AsyncStorage.getItem("username");
          if (cachedName) setUsername(cachedName);

          if (!token) return;

          const res = await axios.get(`${BASE_URL}/sightings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const todayStr = new Date().toDateString();
          const todaySightings = res.data.filter(s => new Date(s.timestamp).toDateString() === todayStr);
          setSightings(todaySightings);
        } catch (err) {
          console.log("Error fetching sightings:", err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchSightings();
    }, [])
  );

  // Split into 2 columns
  const firstSix = sightings;
  const leftCol = firstSix.filter((_, i) => i % 2 === 0);
  const rightCol = firstSix.filter((_, i) => i % 2 !== 0);
  
  const heights = [250, 200, 220, 260, 210, 230]; // left: 0,2,4, right: 1,3,5

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
            <RarityTag rarity={bird.rarity || 'common'} />
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
          <View>
            <Text style={styles.greetingHeader}>HI,</Text>
            <Text style={styles.usernameHeader}>{username.toUpperCase()}</Text>
          </View>
          
          <View style={{ zIndex: 50 }}>
            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Circle cx="12" cy="8" r="4" fill={Colors.sage} />
                <Path d="M4 22 C4 14, 20 14, 20 22" fill={Colors.sage} />
              </Svg>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setDropdownOpen(false); router.push('/profile'); }}>
                  <Text style={styles.dropdownText}>PROFILE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setDropdownOpen(false); router.push('/settings'); }}>
                  <Text style={styles.dropdownText}>SETTINGS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={async () => { 
                  setDropdownOpen(false); 
                  await AsyncStorage.removeItem('token');
                  await AsyncStorage.removeItem('username');
                  router.replace('/login'); 
                }}>
                  <Text style={[styles.dropdownText, { color: Colors.dexRed }]}>LOGOUT</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>LATELY<Text style={{ color: Colors.dimGreen }}>…</Text></Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
             <ActivityIndicator color={Colors.sage} />
          ) : sightings.length === 0 ? (
             <View style={{ padding: 40, alignItems: 'center', marginTop: 40 }}>
               <Text style={{ color: Colors.sage, fontFamily: Fonts.bodyMedium, textAlign: 'center', fontSize: 16 }}>
                 You haven't spotted any birds today! 📸
               </Text>
               <Text style={{ color: "gray", marginTop: 10, textAlign: 'center' }}>
                 Tap the Camera button below to log your first sighting of the day.
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    zIndex: 50
  },
  greetingHeader: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.mutedGreen,
    marginBottom: 4
  },
  usernameHeader: {
    fontFamily: Fonts.pixel,
    fontSize: 11,
    color: Colors.cream
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.forestMid,
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 51
  },
  dropdown: {
    position: 'absolute',
    top: 46,
    right: 0,
    backgroundColor: Colors.forestMid,
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.3)',
    borderRadius: Radii.md,
    width: 124,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(90,120,60,0.1)'
  },
  dropdownText: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.sage
  },
  sectionTitleContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    zIndex: 10
  },
  sectionTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: Colors.sage
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
