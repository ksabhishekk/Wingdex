import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Ellipse, Circle } from 'react-native-svg';
import { BIRDS } from '../data/birds';

const SHAPES = {
  '001': (fill) => (
    <>
      <Ellipse cx="40" cy="50" rx="20" ry="25" fill={`${fill}CC`} />
      <Circle cx="45" cy="25" r="12" fill={`${fill}99`} />
      <Path d="M45 25 L58 35 L40 50 Z" fill={`${fill}BB`} />
      <Path d="M30 65 L20 80 L40 70 Z" fill={`${fill}99`} />
      <Circle cx="48" cy="23" r="2" fill="#fff" />
      <Path d="M56 22 L62 25 L55 27 Z" fill={`${fill}66`} />
    </>
  ),
  '002': (fill) => (
    <>
      <Ellipse cx="40" cy="50" rx="18" ry="22" fill={`${fill}CC`} />
      <Circle cx="42" cy="28" r="10" fill={`${fill}99`} />
      <Path d="M35 45 L55 60 L30 60 Z" fill={`${fill}BB`} />
      <Path d="M30 65 L25 80 L35 70 Z" fill={`${fill}66`} />
      <Circle cx="45" cy="26" r="2" fill="#fff" />
      <Path d="M51 25 L58 27 L50 29 Z" fill={`${fill}66`} />
    </>
  ),
  '003': (fill) => (
    <>
      <Ellipse cx="38" cy="52" rx="22" ry="26" fill={`${fill}CC`} />
      <Circle cx="48" cy="24" r="11" fill={`${fill}99`} />
      <Path d="M38 40 L65 50 L40 65 Z" fill={`${fill}BB`} />
      <Path d="M25 65 L15 85 L35 75 Z" fill={`${fill}DD`} />
      <Circle cx="50" cy="22" r="2" fill="#fff" />
      <Path d="M58 22 L65 24 L57 26 Z" fill={`${fill}66`} />
    </>
  ),
  '004': (fill) => (
    <>
      <Ellipse cx="45" cy="48" rx="16" ry="20" fill={`${fill}CC`} />
      <Circle cx="35" cy="25" r="11" fill={`${fill}99`} />
      <Path d="M45 40 L30 55 L55 60 Z" fill={`${fill}BB`} />
      <Path d="M40 65 L50 80 L35 70 Z" fill={`${fill}99`} />
      <Circle cx="32" cy="23" r="2" fill="#fff" />
      <Path d="M24 23 L18 25 L25 27 Z" fill={`${fill}66`} />
    </>
  ),
  '005': (fill) => (
    <>
      <Ellipse cx="35" cy="45" rx="14" ry="18" fill={`${fill}CC`} />
      <Circle cx="45" cy="25" r="8" fill={`${fill}99`} />
      <Path d="M35 40 L60 20 L40 50 Z" fill={`${fill}BB`} />
      <Path d="M25 55 L10 70 L30 60 Z" fill={`${fill}88`} />
      <Circle cx="47" cy="23" r="1.5" fill="#fff" />
      <Path d="M52 24 L75 22 L51 26 Z" fill={`${fill}66`} />
    </>
  ),
  '006': (fill) => (
    <>
      <Ellipse cx="42" cy="50" rx="15" ry="22" fill={`${fill}CC`} />
      <Circle cx="45" cy="26" r="11" fill={`${fill}99`} />
      <Path d="M42 45 L65 55 L35 60 Z" fill={`${fill}BB`} />
      <Path d="M35 65 L25 80 L40 70 Z" fill={`${fill}99`} />
      <Circle cx="48" cy="24" r="2" fill="#fff" />
      <Path d="M55 24 L62 26 L54 28 Z" fill={`${fill}66`} />
    </>
  ),
};

export default function BirdSilhouette({ bird, size = 80, opacity = 0.7 }) {
  if (!bird) {
    bird = BIRDS[0];
  }
  const shapeId = SHAPES[bird.id] ? bird.id : '001';
  const renderShape = SHAPES[shapeId];
  return (
    <View style={{ width: size, height: size, opacity, justifyContent: 'center', alignItems: 'center' }}>
      <Svg viewBox="0 0 80 80" width={size} height={size}>
        {renderShape(bird.accentColor)}
      </Svg>
    </View>
  );
}
