import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import DexButton from '../components/DexButton';
import { BIRDS } from '../data/birds';
import { Colors, Fonts } from '../theme';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission && permission.granted) {
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
  }, [permission, scanLineAnim]);

  if (!permission) {
    return <View style={StyleSheet.absoluteFill}><Text style={{ color: '#fff' }}>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.screenBg, justifyContent: 'center', padding: 20 }]}>
        <Text style={{ fontFamily: Fonts.pixel, fontSize: 10, color: Colors.cream, marginBottom: 10, textAlign: 'center' }}>
          CAMERA ACCESS
        </Text>
        <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: Colors.mutedGreen, marginBottom: 30, textAlign: 'center' }}>
          WingDex needs camera access to identify bird species.
        </Text>
        <DexButton label="GRANT ACCESS" onPress={requestPermission} />
      </View>
    );
  }

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);

    // Mock AI process
    setTimeout(() => {
      const randomBird = BIRDS[Math.floor(Math.random() * BIRDS.length)];
      const randomConfidence = (82 + Math.random() * 17).toFixed(1);
      const isCollected = Math.random() > 0.65 ? '1' : '0';

      router.push({
        pathname: '/ai-result',
        params: { id: randomBird.id, confidence: randomConfidence, alreadyCollected: isCollected }
      });
      setCapturing(false);
    }, 900);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topBarText}>SCAN MODE</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      <View style={styles.focusContainer} pointerEvents="none">
        <View style={styles.focusBox}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]} />
        </View>
        <Text style={styles.instructionText}>CAPTURE A CLEAR IMAGE OF THE BIRD</Text>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.sideBtn}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
            <Path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-12.28l5.07 5.07" />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.captureBtn} 
          onPress={handleCapture}
          activeOpacity={0.7}
        >
          <View style={styles.captureInner}>
            {capturing && <View style={styles.captureDot} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtn}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
            <Circle cx="11" cy="11" r="8" />
            <Path d="M21 21l-4.35-4.35" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center'
  },
  closeText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '300'
  },
  topBarText: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  focusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  focusBox: {
    width: 210,
    height: 210,
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'rgba(100,200,60,0.85)',
    borderWidth: 0
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(100,200,60,0.8)'
  },
  instructionText: {
    position: 'absolute',
    bottom: 112,
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: 'rgba(140,200,80,0.75)',
    textAlign: 'center',
    width: '100%'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(10,21,10,0.92)',
    paddingTop: 20,
    paddingBottom: 42,
    paddingHorizontal: 20
  },
  sideBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(26,46,26,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(238,232,214,0.96)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.dexRed
  }
});
