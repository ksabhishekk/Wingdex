import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../theme';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [notBirdError, setNotBirdError] = useState(null);

  const cameraRef = useRef(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:5000';

  useEffect(() => {
    if (permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(scanLineAnim, { toValue: 210, duration: 1800, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [permission]);

  const uploadSighting = async (imageUri) => {
    setScanning(true);
    try {
      console.log('Uploading...', imageUri);

      let lat = null;
      let lon = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lon = location.coords.longitude;
        }
      } catch (locErr) {
        console.log('Location fetch error:', locErr);
      }

      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('userId', '1');

      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, 'photo.jpg');

      const res = await axios.post(`${BASE_URL}/sightings/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('AI result:', res.data);

      router.push({
        pathname: '/ai-result',
        params: {
          species: res.data.species,
          confidence: res.data.confidence,
          imageUrl: res.data.imageUrl,
          lore: res.data.lore,
          diet: res.data.diet,
          flight: res.data.flight,
          habitat: res.data.habitat,
          latitude: lat,
          longitude: lon,
        },
      });
    } catch (err) {
      const errData = err.response?.data;
      console.log('UPLOAD ERROR:', errData || err.message);
      if (errData?.error === 'NOT_A_BIRD') {
        setNotBirdError(errData.message || 'No bird detected. Please try again with a bird photo.');
      } else {
        setNotBirdError(errData?.message || 'Something went wrong. Please try again.');
      }

    } finally {
      setScanning(false);
    }
  };

  const handleCapture = async () => {
    if (capturing || !isCameraReady) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (photo?.uri) await uploadSighting(photo.uri);
    } catch (err) {
      console.log('Capture error:', err);
    }
    setCapturing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 1 });
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (uri) await uploadSighting(uri);
    } catch (err) {
      console.log('Picker error:', err);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <Text style={styles.permissionText}>CAMERA ACCESS REQUIRED</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
          <Text style={{ color: '#fff' }}>GRANT ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* TOP BAR */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topBarText}>SCAN MODE</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      {/* SCAN BOX */}
      <View style={styles.focusContainer} pointerEvents="none">
        <View style={styles.focusBox}>
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]} />
        </View>
      </View>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.sideBtn} onPress={pickImage}>
          <Text style={{ color: '#fff' }}>📁</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} disabled={scanning}>
          <View style={styles.captureInner}>
            {capturing && <View style={styles.captureDot} />}
          </View>
        </TouchableOpacity>

        <View style={styles.sideBtn} />
      </View>

      {/* SCANNING OVERLAY */}
      {scanning && (
        <View style={styles.scanningOverlay}>
          <View style={styles.scanningBox}>
            <ActivityIndicator size="large" color="#8FAF7A" />
            <Text style={styles.scanningTitle}>ANALYZING...</Text>
            <Text style={styles.scanningSubtext}>Identifying species via AI</Text>
          </View>
        </View>
      )}

      {/* NOT A BIRD MODAL */}
      {notBirdError && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>🚫</Text>
            <Text style={styles.errorTitle}>NOT A BIRD</Text>
            <Text style={styles.errorMsg}>{notBirdError}</Text>
            <TouchableOpacity style={styles.errorBtn} onPress={() => setNotBirdError(null)}>
              <Text style={styles.errorBtnText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  permission: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },

  permissionText: { color: '#fff', marginBottom: 20, fontFamily: Fonts.pixel },

  permissionBtn: { padding: 12, backgroundColor: '#333', borderRadius: 8 },

  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  closeBtn: { width: 44, height: 44, justifyContent: 'center' },

  closeText: { color: '#fff', fontSize: 24 },

  topBarText: { color: '#fff', fontFamily: Fonts.pixel, fontSize: 10 },

  focusContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  focusBox: { width: 210, height: 210 },

  scanLine: { height: 2, backgroundColor: 'green' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },

  sideBtn: {
    width: 50, height: 50,
    backgroundColor: '#333',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureBtn: {
    width: 70, height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureInner: { width: 60, height: 60, borderRadius: 30 },

  captureDot: { width: 20, height: 20, backgroundColor: 'red', borderRadius: 10 },

  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },

  scanningBox: {
    backgroundColor: '#0D1A0D',
    borderWidth: 1,
    borderColor: 'rgba(143,175,122,0.4)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },

  scanningTitle: {
    color: '#8FAF7A',
    fontFamily: Fonts.pixel,
    fontSize: 12,
    marginTop: 12,
    letterSpacing: 2,
  },

  scanningSubtext: { color: 'rgba(143,175,122,0.6)', fontFamily: Fonts.pixel, fontSize: 8 },

  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  errorBox: {
    backgroundColor: '#1A0808',
    borderWidth: 1,
    borderColor: 'rgba(200,50,50,0.5)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: 300,
  },

  errorIcon: { fontSize: 48, marginBottom: 12 },

  errorTitle: {
    color: '#FF5555',
    fontFamily: Fonts.pixel,
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 12,
  },

  errorMsg: {
    color: 'rgba(255,200,200,0.8)',
    fontFamily: Fonts.pixel,
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 24,
  },

  errorBtn: { backgroundColor: '#FF5555', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 8 },

  errorBtnText: { color: '#000', fontFamily: Fonts.pixel, fontSize: 10, letterSpacing: 1 },
});
