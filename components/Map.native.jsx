import React from 'react';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';

export default function NativeMap({ initialRegion, circleCenter, customMapStyle, style }) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      customMapStyle={customMapStyle}
      style={style}
      scrollEnabled={false}
      initialRegion={initialRegion}
    >
      <Circle
        center={circleCenter}
        radius={500}
        fillColor="rgba(255, 60, 0, 0.3)"
        strokeColor="rgba(255, 120, 0, 0.8)"
        strokeWidth={2}
      />
    </MapView>
  );
}
