import React from 'react';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';

export default function NativeMap({ initialRegion, region, circleCenter, points, customMapStyle, style }) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      customMapStyle={customMapStyle}
      style={style}
      scrollEnabled={true}
      initialRegion={initialRegion}
      region={region}
    >
      {points && points.length > 0 ? (
        points.map((p, idx) => (
          <Circle
            key={p.id || idx}
            center={{ latitude: p.latitude, longitude: p.longitude }}
            radius={80000} // Roughly 80km radius for visibility on zoomed out map
            fillColor="rgba(255, 60, 0, 0.25)"
            strokeColor="rgba(255, 120, 0, 0.4)"
            strokeWidth={1}
          />
        ))
      ) : (
        circleCenter && (
          <Circle
            center={circleCenter}
            radius={500}
            fillColor="rgba(255, 60, 0, 0.3)"
            strokeColor="rgba(255, 120, 0, 0.8)"
            strokeWidth={2}
          />
        )
      )}
    </MapView>
  );
}
