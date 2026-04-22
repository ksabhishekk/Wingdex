import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Fonts, Radii, Spacing } from '../theme';

// ── Constants ─────────────────────────────────────────────────────────────────
const WEEKS = 52;        // full year
const CELL = 11;         // px per cell
const GAP = 2;           // px gap between cells
const STEP = CELL + GAP; // 13px per step
const DAY_LABEL_W = 28;  // width of the Mon/Wed/Fri column

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Date helpers ──────────────────────────────────────────────────────────────
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ── Color scale (GitHub-inspired, WingDex palette) ────────────────────────────
function cellBg(count, isFuture) {
  if (isFuture)   return 'transparent';
  if (!count)     return 'rgba(30,50,28,0.55)';
  if (count === 1) return '#2D6A2D';
  if (count === 2) return '#3D8A3D';
  if (count === 3) return '#52A852';
  return '#6EC86E';      // 4+ → brightest
}

// ── Stats computation ─────────────────────────────────────────────────────────
function computeStats(sightings) {
  const countsByDate = {};
  sightings.forEach(s => {
    const key = toDateStr(new Date(s.timestamp));
    countsByDate[key] = (countsByDate[key] || 0) + 1;
  });

  const today = new Date();
  const todayStr = toDateStr(today);

  // Year total
  const oneYearAgo = addDays(today, -(WEEKS * 7 - 1));
  let yearTotal = 0;
  Object.entries(countsByDate).forEach(([k, v]) => {
    if (k >= toDateStr(oneYearAgo)) yearTotal += v;
  });

  // Current streak (walk back from today or yesterday)
  let current = 0;
  let cur = new Date(today);
  while (true) {
    if (countsByDate[toDateStr(cur)]) { current++; cur = addDays(cur, -1); }
    else if (current === 0) { cur = addDays(cur, -1); if (countsByDate[toDateStr(cur)]) { current++; cur = addDays(cur, -1); } else break; }
    else break;
  }

  // Best streak
  const sorted = Object.keys(countsByDate).sort();
  let best = 0, run = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || sorted[i] !== toDateStr(addDays(new Date(sorted[i-1]), 1))) run = 1;
    else run++;
    if (run > best) best = run;
  }

  return { countsByDate, yearTotal, current, best, todayStr };
}

// ── Grid builder ──────────────────────────────────────────────────────────────
function buildGrid(today) {
  // Align to the Sunday of the current week
  const dow = today.getDay(); // 0=Sun
  const startOfCurrentWeek = addDays(today, -dow);
  const startDate = addDays(startOfCurrentWeek, -(WEEKS - 1) * 7);

  const columns = [];   // columns[wi][di] = { date, dateStr }
  const monthLabels = []; // { wi, label }

  for (let wi = 0; wi < WEEKS; wi++) {
    const col = [];
    let prevMonth = -1;
    for (let di = 0; di < 7; di++) {
      const d = addDays(startDate, wi * 7 + di);
      const ds = toDateStr(d);
      col.push({ date: d, dateStr: ds });
      if (di === 0) {
        const m = d.getMonth();
        if (m !== prevMonth) {
          monthLabels.push({ wi, label: MONTH_NAMES[m] });
          prevMonth = m;
        }
      }
    }
    columns.push(col);
  }

  return { columns, monthLabels, startDate };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StreakCard({ sightings = [] }) {
  const { countsByDate, yearTotal, current, best, todayStr } = useMemo(
    () => computeStats(sightings),
    [sightings]
  );

  const today = new Date();
  const todayDateStr = toDateStr(today);
  const { columns, monthLabels } = useMemo(() => buildGrid(today), []);

  // Day-of-week row labels (GitHub shows Mon, Wed, Fri — rows 1, 3, 5 in Sun-anchored grid)
  const rowLabels = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

  const totalW = WEEKS * STEP - GAP; // grid pixel width

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.yearTotal}>
          <Text style={styles.yearCount}>{yearTotal}</Text>
          <Text style={styles.yearSuffix}> sightings in the last year</Text>
        </Text>
        <View style={styles.streakPills}>
          <View style={styles.pill}>
            <Text style={styles.pillFlame}>🔥</Text>
            <Text style={styles.pillNum}>{current}</Text>
            <Text style={styles.pillLabel}>streak</Text>
          </View>
          <View style={[styles.pill, { borderColor: 'rgba(90,120,60,0.15)' }]}>
            <Text style={styles.pillNum}>{best}</Text>
            <Text style={styles.pillLabel}>best</Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable graph ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ paddingBottom: 4 }}>

          {/* Month labels row */}
          <View style={[styles.monthRow, { marginLeft: DAY_LABEL_W }]}>
            {monthLabels.map(({ wi, label }, i) => {
              // Avoid overlapping: skip if too close to previous
              const prev = monthLabels[i - 1];
              if (prev && wi - prev.wi < 3) return null;
              return (
                <Text
                  key={i}
                  style={[styles.monthLabel, { left: wi * STEP }]}
                >
                  {label}
                </Text>
              );
            })}
            {/* spacer */}
            <View style={{ width: totalW }} />
          </View>

          {/* Grid rows (7 rows = Sun-Sat) */}
          <View style={styles.gridArea}>
            {/* Day labels column */}
            <View style={[styles.dayLabelCol, { width: DAY_LABEL_W }]}>
              {Array.from({ length: 7 }, (_, di) => (
                <View key={di} style={{ height: STEP - GAP, marginBottom: GAP, justifyContent: 'center' }}>
                  {rowLabels[di] && (
                    <Text style={styles.dayLabel}>{rowLabels[di]}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Cell grid */}
            <View style={styles.cellGrid}>
              {Array.from({ length: 7 }, (_, di) => (
                <View key={di} style={styles.cellRow}>
                  {columns.map((col, wi) => {
                    const { dateStr, date } = col[di];
                    const count = countsByDate[dateStr] || 0;
                    const isFuture = dateStr > todayDateStr;
                    const isToday = dateStr === todayDateStr;
                    return (
                      <View
                        key={wi}
                        style={[
                          styles.cell,
                          { backgroundColor: cellBg(count, isFuture) },
                          isToday && styles.cellToday,
                          wi < WEEKS - 1 && { marginRight: GAP },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Footer legend */}
          <View style={[styles.legendRow, { marginLeft: DAY_LABEL_W }]}>
            <Text style={styles.legendText}>Less</Text>
            {[0, 1, 2, 3, 4].map(n => (
              <View
                key={n}
                style={[styles.legendCell, { backgroundColor: cellBg(n, false) }]}
              />
            ))}
            <Text style={styles.legendText}>More</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(13,22,13,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.2)',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: 14,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  yearTotal: {
    flexShrink: 1,
  },
  yearCount: {
    fontFamily: Fonts.pixel,
    fontSize: 13,
    color: Colors.cream,
  },
  yearSuffix: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.mutedGreen,
  },
  streakPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(26,46,26,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(110,200,110,0.2)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillFlame: { fontSize: 11 },
  pillNum: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: Colors.cream,
  },
  pillLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.mutedGreen,
  },
  // Month labels
  monthRow: {
    position: 'relative',
    height: 14,
    marginBottom: 3,
  },
  monthLabel: {
    position: 'absolute',
    fontFamily: Fonts.pixel,
    fontSize: 6.5,
    color: Colors.mutedGreen,
    top: 0,
  },
  // Grid layout
  gridArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabelCol: {
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  dayLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.mutedGreen,
  },
  cellGrid: {
    gap: GAP,
  },
  cellRow: {
    flexDirection: 'row',
    marginBottom: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 2,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  // Legend
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  legendCell: {
    width: CELL,
    height: CELL,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.mutedGreen,
  },
});
