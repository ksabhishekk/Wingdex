import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RARITY_CONFIG, Fonts } from '../theme';

export default function RarityTag({ rarity, size = 'sm' }) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const isMd = size === 'md';

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.border }, isMd && styles.containerMd]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }, isMd && styles.textMd]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 99,
    alignSelf: 'flex-start'
  },
  containerMd: {
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4
  },
  text: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    letterSpacing: 0.5
  },
  textMd: {
    fontSize: 8
  }
});
