import React, { createElement } from 'react';
import { View } from 'react-native';

export default function WebMap({ initialRegion, region, circleCenter, points, customMapStyle, style }) {
  const mapCenterLat = region?.latitude || circleCenter?.latitude || 37.78825;
  const mapCenterLng = region?.longitude || circleCenter?.longitude || -122.4324;
  // Use a zoom level based on delta if available, otherwise default to 3
  let zoom = 3;
  if (region?.latitudeDelta) {
    // Rough calculation: delta 360 is zoom 0, delta 180 is zoom 1...
    zoom = Math.round(Math.log2(360 / region.latitudeDelta));
    if (zoom < 1) zoom = 1;
    if (zoom > 15) zoom = 15;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>body, html, #map { height: 100%; width: 100%; margin: 0; padding: 0; background-color: #0A1208; }</style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${mapCenterLat}, ${mapCenterLng}], ${zoom});
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);
            
            var points = ${JSON.stringify(points || [])};
            points.forEach(function(p) {
                L.circle([p.latitude, p.longitude], {
                    color: 'rgba(255, 120, 0, 0.4)',
                    fillColor: 'rgba(255, 60, 0, 0.25)',
                    fillOpacity: 0.8,
                    radius: 80000
                }).addTo(map);
            });
            if (points.length === 0) {
                L.circle([${mapCenterLat}, ${mapCenterLng}], {
                    color: 'rgba(255, 120, 0, 0.8)',
                    fillColor: 'rgba(255, 60, 0, 0.3)',
                    fillOpacity: 0.8,
                    radius: 20000
                }).addTo(map);
            }
        </script>
    </body>
    </html>
  `;

  return (
    <View style={[style, { overflow: 'hidden', backgroundColor: '#0A1208', borderWidth: 1, borderColor: 'rgba(90,120,60,0.3)' }]}>
      {createElement('iframe', {
        srcDoc: html,
        style: { width: '100%', height: '100%', border: 'none' },
        title: "Web Heatmap"
      })}
    </View>
  );
}
