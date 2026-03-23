import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radii } from '../theme';

export default function DexButton({ label, onPress, variant = 'primary', fullWidth, style }) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        fullWidth && styles.fullWidth,
        style
      ]}
    >
      <Text style={[
        styles.text,
        isPrimary && styles.textPrimary,
        isOutline && styles.textOutline,
        isGhost && styles.textGhost
      ]}>
        {`\u25B6`} {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  fullWidth: {
    width: '100%'
  },
  primary: {
    backgroundColor: Colors.dexRed,
    shadowColor: Colors.dexRedDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.4)',
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  text: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    letterSpacing: 1,
  },
  textPrimary: {
    color: Colors.cream
  },
  textOutline: {
    color: Colors.sage
  },
  textGhost: {
    color: Colors.mutedGreen
  }
});
