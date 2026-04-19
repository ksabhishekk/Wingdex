import React from 'react';
import { View, Text } from 'react-native';

export default function WebMap({ initialRegion, circleCenter, customMapStyle, style }) {
  return (
    <View style={[style, { backgroundColor: '#0A1208', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(90,120,60,0.3)' }]}>
      <Text style={{ color: '#8FAF7A', fontFamily: 'monospace', fontSize: 12 }}>[ Interactive Map Disabled on Web ]</Text>
      <Text style={{ color: '#8FAF7A', fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>
        HEATMAP COORDINATES:
      </Text>
      <Text style={{ color: '#8FAF7A', fontFamily: 'monospace', fontSize: 10, marginTop: 2 }}>
        LAT: {circleCenter?.latitude?.toFixed(4) || "0.0000"}
      </Text>
      <Text style={{ color: '#8FAF7A', fontFamily: 'monospace', fontSize: 10, marginTop: 2 }}>
        LON: {circleCenter?.longitude?.toFixed(4) || "0.0000"}
      </Text>
    </View>
  );
}
