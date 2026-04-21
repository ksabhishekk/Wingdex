import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Map from '../components/Map';
import { Colors, Fonts, Radii, Spacing } from '../theme';

const mapCustomStyle = [
  { "elementType": "geometry", "stylers": [{"color": "#0A1208"}] },
  { "elementType": "labels.text.fill", "stylers": [{"color": "#8FAF7A"}] },
  { "elementType": "labels.text.stroke", "stylers": [{"color": "#0A1208"}] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{"color": "#0D1A0D"}] }
];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function BirdDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [sighting, setSighting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapMessage, setHeatmapMessage] = useState("");
  const [mapRegion, setMapRegion] = useState(null);

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.12:5000";

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/sightings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const found = res.data.find((s) => String(s.id) === String(id));
        setSighting(found || null);
      } catch (err) {
        console.log("DETAIL LOAD ERROR:", err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (!sighting || !sighting.species) return;

    const fetchHeatmap = async () => {
      setHeatmapLoading(true);
      setHeatmapMessage("");
      try {
        const token = await AsyncStorage.getItem("token");
        const monthNum = selectedMonth + 1;
        const res = await axios.get(`${BASE_URL}/sightings/heatmap?species=${encodeURIComponent(sighting.species)}&month=${monthNum}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const points = res.data || [];
        setHeatmapPoints(points);

        if (points.length === 0) {
          const lore = (sighting.lore || "").toLowerCase();
          if (lore.includes("resident") || lore.includes("non-migratory") || lore.includes("sedentary") || lore.includes("year-round")) {
             setHeatmapMessage("Species is predominantly non-migratory (resident).");
          } else {
             setHeatmapMessage("No sighting data available for this month.");
          }
          setMapRegion({
            latitude: sighting.latitude || 37.78825,
            longitude: sighting.longitude || -122.4324,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else {
          const lats = points.map(p => p.latitude);
          const lngs = points.map(p => p.longitude);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);

          setMapRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(maxLat - minLat + 2, 2),
            longitudeDelta: Math.max(maxLng - minLng + 2, 2),
          });
        }
      } catch (err) {
        console.log("HEATMAP ERROR:", err.message);
        setHeatmapPoints([]);
        setHeatmapMessage("Could not load heatmap data.");
      } finally {
        setHeatmapLoading(false);
      }
    };

    fetchHeatmap();
  }, [sighting, selectedMonth]);

  const performDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(`${BASE_URL}/sightings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push("/library");
    } catch (err) {
      console.log("Failed to delete", err);
      if (Platform.OS === 'web') window.alert("Could not delete sighting.");
      else Alert.alert("Error", "Could not delete sighting.");
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color: Colors.sage, fontFamily: Fonts.pixel, fontSize: 10 }}>{"< BACK"}</Text>
          </TouchableOpacity>
          {sighting && (
            <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
              <Text style={{ color: Colors.dexRed, fontFamily: Fonts.pixel, fontSize: 10 }}>[ DELETE ]</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
             <ActivityIndicator color={Colors.sage} style={{ marginTop: 60 }} size="large" />
          ) : !sighting ? (
             <Text style={styles.errorText}>Sighting Not Found</Text>
          ) : (
            <>
              {/* HERO CARD */}
              <View style={styles.heroWrapper}>
                <Image
                  source={{ uri: `${BASE_URL}${sighting.imageUrl}` }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <LinearGradient 
                  colors={['transparent', 'rgba(10,18,8,0.9)']} 
                  style={styles.heroOverlay}
                />
                <View style={styles.heroTitleBox}>
                  <Text style={styles.birdName}>{sighting.species || 'Unknown Species'}</Text>
                  <Text style={styles.birdMeta}>WINGDEX ID: #{sighting.id} • CONFIDENCE: {(parseFloat(sighting.confidence) || 0).toFixed(1)}%</Text>
                </View>
              </View>

              {/* LORE SECTION */}
              <View style={styles.loreBox}>
                <Text style={styles.sectionTitle}>BIODATA</Text>
                <Text style={styles.loreText}>
                  {sighting.lore || `This ${sighting.species || 'specimen'} is predominantly observed during daylight hours. Known for erratic flight patterns during seasonal shifts, its vibrant plumage makes it easily distinguishable against natural foliage.`}
                </Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statChip}>
                    <Text style={styles.statLabel}>DIET</Text>
                    <Text style={styles.statValue}>{sighting.diet || "OMNIVORE"}</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Text style={styles.statLabel}>FLIGHT</Text>
                    <Text style={styles.statValue}>{sighting.flight || "AGILE"}</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Text style={styles.statLabel}>HABITAT</Text>
                    <Text style={styles.statValue}>{sighting.habitat || "FOREST"}</Text>
                  </View>
                </View>
              </View>

              {/* MIGRATION RADAR */}
              <View style={styles.radarSection}>
                <Text style={styles.sectionTitle}>MIGRATION HEATMAP</Text>
                
                <View style={styles.radarContainer}>
                  <Map
                    customMapStyle={mapCustomStyle}
                    style={StyleSheet.absoluteFill}
                    region={mapRegion || {
                      latitude: sighting.latitude || 37.78825,
                      longitude: sighting.longitude || -122.4324,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                    initialRegion={{
                      latitude: sighting.latitude || 37.78825,
                      longitude: sighting.longitude || -122.4324,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                    circleCenter={{
                      latitude: sighting.latitude || 37.78825,
                      longitude: sighting.longitude || -122.4324,
                    }}
                    points={heatmapPoints}
                  />
                  
                  {heatmapLoading && (
                    <View style={styles.radarOverlay}>
                      <ActivityIndicator color={Colors.sage} />
                    </View>
                  )}
                  {!heatmapLoading && heatmapPoints.length === 0 && heatmapMessage ? (
                    <View style={styles.radarOverlay}>
                      <Text style={styles.radarOverlayText}>{heatmapMessage}</Text>
                    </View>
                  ) : null}
                </View>
                
                {/* MONTH SELECTOR SCROLLER */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.monthScroller}
                >
                  {MONTHS.map((month, idx) => (
                    <TouchableOpacity 
                      key={idx}
                      style={[
                        styles.monthChip,
                        selectedMonth === idx && styles.monthChipActive
                      ]}
                      onPress={() => setSelectedMonth(idx)}
                    >
                      <Text style={[
                        styles.monthText,
                        selectedMonth === idx && styles.monthTextActive
                      ]}>{month}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* CUSTOM OVERLAY MODAL */}
      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Are you sure you want to permanently delete this sighting?</Text>
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={styles.confirmBtnCancel}>
                <Text style={styles.confirmBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={performDelete} style={styles.confirmBtnDelete}>
                <Text style={styles.confirmBtnTextDelete}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backBtn: {
    paddingVertical: 8,
  },
  scrollContainer: {
    paddingBottom: 20
  },
  errorText: {
    color: Colors.sage,
    fontFamily: Fonts.bodyMedium,
    textAlign: 'center',
    marginTop: 40
  },
  heroWrapper: {
    marginHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    height: 280,
    backgroundColor: '#0A1208',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.2)',
    marginBottom: Spacing.lg
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: Spacing.md
  },
  heroTitleBox: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md
  },
  birdName: {
    fontFamily: Fonts.pixel,
    fontSize: 16,
    color: Colors.cream,
    marginBottom: 6
  },
  birdMeta: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.mutedGreen
  },
  loreBox: {
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(10,18,8,0.7)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.15)',
    marginBottom: Spacing.lg
  },
  sectionTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: Colors.sage,
    marginBottom: 12
  },
  loreText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(230,240,210,0.8)',
    lineHeight: 20,
    marginBottom: 16
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statChip: {
    backgroundColor: 'rgba(20,35,16,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.3)',
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center'
  },
  statLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.mutedGreen,
    marginBottom: 4
  },
  statValue: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: Colors.cream
  },
  radarSection: {
    marginHorizontal: Spacing.md,
    marginBottom: 0
  },
  radarContainer: {
    width: '100%',
    height: 450,
    backgroundColor: '#0A1208',
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.3)',
    marginBottom: Spacing.md
  },
  radarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,18,8,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md
  },
  radarOverlayText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.mutedGreen,
    textAlign: 'center',
    lineHeight: 14
  },
  heatBubbleContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 60, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -30, // Offset to center on coordinates
    marginTop: -30,
  },
  heatCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 120, 0, 0.9)',
    shadowColor: '#FF6000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10
  },
  monthScroller: {
    paddingRight: Spacing.md
  },
  monthChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(10,18,8,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.2)',
    marginRight: 8
  },
  monthChipActive: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage
  },
  monthText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.mutedGreen
  },
  monthTextActive: {
    color: '#0A1208'
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  confirmBox: {
    width: 300,
    backgroundColor: '#122012',
    borderRadius: Radii.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.5)',
    alignItems: 'center'
  },
  confirmTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 14,
    color: Colors.dexRed,
    marginBottom: Spacing.sm
  },
  confirmText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    color: Colors.mutedGreen,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.xl
  },
  confirmBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  confirmBtnCancel: {
    flex: 1,
    backgroundColor: 'rgba(90,120,60,0.2)',
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    alignItems: 'center',
    marginRight: Spacing.sm
  },
  confirmBtnDelete: {
    flex: 1,
    backgroundColor: Colors.dexRed,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    alignItems: 'center',
    marginLeft: Spacing.sm
  },
  confirmBtnText: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: Colors.cream
  },
  confirmBtnTextDelete: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: '#000'
  }
});