import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts, Radii, Spacing } from '../theme';

// ── Category normalization ────────────────────────────────────────────────────

const HABITAT_KEYWORDS = [
  { label: 'Forest',    color: '#5A8A3C', keys: ['forest', 'woodland', 'wood', 'jungle', 'rainforest', 'mangrove', 'tree'] },
  { label: 'Coastal',   color: '#3C8A8A', keys: ['coast', 'sea', 'ocean', 'shore', 'beach', 'marine', 'cliff', 'island'] },
  { label: 'Grassland', color: '#C8A83C', keys: ['grass', 'meadow', 'savann', 'prairie', 'plain', 'steppe', 'field', 'open'] },
  { label: 'Wetland',   color: '#3C6A8A', keys: ['wetland', 'marsh', 'swamp', 'lake', 'river', 'pond', 'stream', 'freshwater', 'riparian'] },
  { label: 'Urban',     color: '#8A6A5A', keys: ['urban', 'city', 'town', 'suburb', 'garden', 'park', 'agricultural', 'farm'] },
  { label: 'Scrubland', color: '#8A7A3C', keys: ['scrub', 'bush', 'heath', 'chaparral', 'shrub', 'desert', 'arid'] },
];

const DIET_KEYWORDS = [
  { label: 'Insects',   color: '#C87A3C', keys: ['insect', 'bug', 'beetle', 'moth', 'fly', 'worm', 'larva', 'invertebrate', 'arthropod'] },
  { label: 'Fish',      color: '#3C7AC8', keys: ['fish', 'salmon', 'trout', 'eel', 'crustacean', 'shellfish', 'aquatic'] },
  { label: 'Seeds',     color: '#8AC83C', keys: ['seed', 'grain', 'nut', 'cereal', 'grass seed'] },
  { label: 'Fruit',     color: '#C84A7A', keys: ['fruit', 'berry', 'nectar', 'pollen', 'flower'] },
  { label: 'Small animals', color: '#8A3C8A', keys: ['rodent', 'mouse', 'rat', 'vole', 'rabbit', 'mammal', 'lizard', 'reptile', 'amphibian', 'frog'] },
  { label: 'Carrion',   color: '#5A5A5A', keys: ['carri', 'carcass', 'scaveng', 'dead', 'offal'] },
  { label: 'Omnivore',  color: '#C8C83C', keys: ['omniv', 'varied', 'opportun', 'wide range', 'various'] },
];

function normalize(text, categories) {
  if (!text) return 'Other';
  const lower = text.toLowerCase();
  for (const cat of categories) {
    if (cat.keys.some(k => lower.includes(k))) return cat.label;
  }
  return 'Other';
}

function groupSightings(sightings, mode) {
  const categories = mode === 'habitat' ? HABITAT_KEYWORDS : DIET_KEYWORDS;
  const counts = {};

  sightings.forEach(s => {
    const label = normalize(s[mode], categories);
    counts[label] = (counts[label] || 0) + 1;
  });

  // Build final array with colors
  const allLabels = [...categories.map(c => c.label), 'Other'];
  const colorMap = Object.fromEntries(categories.map(c => [c.label, c.color]));
  colorMap['Other'] = '#6A6A6A';

  return allLabels
    .filter(label => counts[label])
    .map(label => ({ label, value: counts[label], color: colorMap[label] }))
    .sort((a, b) => b.value - a.value);
}

// ── SVG Donut helpers ─────────────────────────────────────────────────────────

const SIZE = 160;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 60;
const R_INNER = 34;

function polarToXY(angleDeg, r) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

function arcPath(startAngle, endAngle) {
  const large = endAngle - startAngle > 180 ? 1 : 0;
  const o1 = polarToXY(startAngle, R_OUTER);
  const o2 = polarToXY(endAngle, R_OUTER);
  const i1 = polarToXY(endAngle, R_INNER);
  const i2 = polarToXY(startAngle, R_INNER);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HabitatChart({ sightings = [] }) {
  const [mode, setMode] = useState('habitat');

  const data = groupSightings(sightings, mode);
  const total = data.reduce((s, d) => s + d.value, 0);

  // Build arc slices
  const slices = [];
  let current = 0;
  data.forEach((d, i) => {
    const sweep = (d.value / total) * 360;
    // Leave a 1.5° gap between slices for aesthetics
    const gap = data.length > 1 ? 1.5 : 0;
    slices.push({
      ...d,
      startAngle: current + gap / 2,
      endAngle: current + sweep - gap / 2,
    });
    current += sweep;
  });

  const hasData = total > 0;

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabs}>
        {['habitat', 'diet'].map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.tab, mode === m && styles.tabActive]}
            onPress={() => setMode(m)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
              {m.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!hasData ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Add sightings to see your{'\n'}{mode} breakdown</Text>
        </View>
      ) : (
        <View style={styles.chartRow}>
          {/* Donut */}
          <Svg width={SIZE} height={SIZE}>
            {/* Background ring */}
            <Circle
              cx={CX} cy={CY} r={R_OUTER}
              fill="none"
              stroke="rgba(90,120,60,0.08)"
              strokeWidth={R_OUTER - R_INNER}
            />
            {slices.map((s, i) => (
              <Path
                key={i}
                d={arcPath(s.startAngle, s.endAngle)}
                fill={s.color}
                opacity={0.92}
              />
            ))}
            {/* Center label */}
            <SvgText
              x={CX} y={CY - 7}
              textAnchor="middle"
              fill={Colors.cream}
              fontSize="18"
              fontFamily={Fonts.pixel}
            >
              {total}
            </SvgText>
            <SvgText
              x={CX} y={CY + 9}
              textAnchor="middle"
              fill={Colors.mutedGreen}
              fontSize="6"
              fontFamily={Fonts.pixel}
            >
              SIGHTINGS
            </SvgText>
          </Svg>

          {/* Legend */}
          <View style={styles.legend}>
            {slices.map((s, i) => {
              const pct = Math.round((s.value / total) * 100);
              return (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: s.color }]} />
                  <Text style={styles.legendLabel} numberOfLines={1}>
                    {s.label}
                  </Text>
                  <Text style={[styles.legendPct, { color: s.color }]}>
                    {pct}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(20,35,16,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.18)',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: 14,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(20,35,16,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.25)',
  },
  tabActive: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage,
  },
  tabText: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.mutedGreen,
  },
  tabTextActive: {
    color: '#0A1208',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 7,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontFamily: Fonts.pixel,
    fontSize: 6.5,
    color: Colors.cream,
  },
  legendPct: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
  },
  empty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.mutedGreen,
    textAlign: 'center',
    lineHeight: 13,
  },
});
