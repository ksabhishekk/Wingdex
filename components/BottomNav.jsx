import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Fonts } from '../theme';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/home';
  const isDex = pathname === '/library';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => router.push('/home')}>
        <Text style={[styles.tabText, isHome && styles.tabActive]}>HOME</Text>
      </TouchableOpacity>

      <View style={styles.centerWrapper}>
        <TouchableOpacity style={styles.cameraButton} onPress={() => router.push('/camera')}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></Path>
            <Circle cx="12" cy="13" r="4"></Circle>
          </Svg>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.tab} onPress={() => router.push('/library')}>
        <Text style={[styles.tabText, isDex && styles.tabActive]}>DEX</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13,26,13,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(90,120,60,0.2)',
    paddingBottom: 28,
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  tabText: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: Colors.mutedGreen
  },
  tabActive: {
    color: Colors.sage
  },
  centerWrapper: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.dexRed,
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dexRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8
  }
});
