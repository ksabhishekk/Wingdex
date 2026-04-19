import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors, Fonts } from '../theme';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const cameraRef = useRef(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.12:5000";

  useEffect(() => {
    if (permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(scanLineAnim, {
            toValue: 210,
            duration: 1800,
            useNativeDriver: true
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [permission]);

  // -----------------------------
  // UPLOAD (FIXED SAFE VERSION)
  // -----------------------------
const uploadSighting = async (imageUri) => {
  try {
    console.log("Uploading...", imageUri);

    let lat = null;
    let lon = null;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      }
    } catch (locErr) {
      console.log("Location fetch error:", locErr);
    }

    const token = await AsyncStorage.getItem("token");

    const formData = new FormData();

    formData.append("userId", "1");

    const response = await fetch(imageUri);
    const blob = await response.blob();

    formData.append("image", blob, "photo.jpg");

const res = await axios.post(`${BASE_URL}/sightings/analyze`, formData, {
  headers: {
    "Content-Type": "multipart/form-data",
    "Authorization": `Bearer ${token}`
  },
});

console.log("AI + Upload result:", res.data);

router.push({
  pathname: "/ai-result",
  params: {
    species: res.data.species,
    confidence: res.data.confidence,
    imageUrl: res.data.imageUrl,
    lore: res.data.lore,
    diet: res.data.diet,
    flight: res.data.flight,
    habitat: res.data.habitat,
    latitude: lat,
    longitude: lon
  },
});

  } catch (err) {
    console.log("UPLOAD ERROR:", err.response?.data || err.message);
  }
};

  // -----------------------------
  // CAMERA CAPTURE (mobile only)
  // -----------------------------
  const handleCapture = async () => {
    console.log("Capture pressed. Attempting to take picture...");

    if (capturing || !isCameraReady) return;

    setCapturing(true);

    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (photo?.uri) {
        await uploadSighting(photo.uri);
      }
    } catch (err) {
      console.log("Capture error:", err);
    }

    setCapturing(false);
  };

  // -----------------------------
  // FILE PICKER (FIXED)
  // -----------------------------
  const pickImage = async () => {
  try {
    console.log("Opening picker...");

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: "images",
  quality: 1,
});

    console.log("Picker result:", result);

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      console.log("No URI found");
      return;
    }

    console.log("Picked URI:", uri);

    await uploadSighting(uri);
  } catch (err) {
    console.log("Picker error:", err);
  }
};

  // -----------------------------
  // PERMISSION UI
  // -----------------------------
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <Text style={styles.permissionText}>CAMERA ACCESS REQUIRED</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
          <Text style={{ color: "#fff" }}>GRANT ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* CAMERA (still shown on web, even if limited) */}
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

      {/* CENTER UI */}
      <View style={styles.focusContainer} pointerEvents="none">
        <View style={styles.focusBox}>
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineAnim }] }
            ]}
          />
        </View>
      </View>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>

        <TouchableOpacity style={styles.sideBtn} onPress={pickImage}>
          <Text style={{ color: "#fff" }}>📁</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
          <View style={styles.captureInner}>
            {capturing && <View style={styles.captureDot} />}
          </View>
        </TouchableOpacity>

        <View style={styles.sideBtn} />
      </View>

    </View>
  );
}

// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  permission: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000"
  },

  permissionText: {
    color: "#fff",
    marginBottom: 20,
    fontFamily: Fonts.pixel
  },

  permissionBtn: {
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20
  },

  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: "center"
  },

  closeText: {
    color: "#fff",
    fontSize: 24
  },

  topBarText: {
    color: "#fff",
    fontFamily: Fonts.pixel,
    fontSize: 10
  },

  focusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  focusBox: {
    width: 210,
    height: 210
  },

  scanLine: {
    height: 2,
    backgroundColor: "green"
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20
  },

  sideBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#333",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center"
  },

  captureBtn: {
    width: 70,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center"
  },

  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30
  },

  captureDot: {
    width: 20,
    height: 20,
    backgroundColor: "red",
    borderRadius: 10
  }
});