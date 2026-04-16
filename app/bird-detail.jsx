import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../theme';

export default function BirdDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [sighting, setSighting] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "http://192.168.1.17:5000/sightings?userId=1"
        );

        const data = await res.json();

        const found = data.find((s) => String(s.id) === String(id));

        setSighting(found || null);
      } catch (err) {
        console.log("DETAIL LOAD ERROR:", err);
      }
    };

    load();
  }, [id]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[Colors.screenBg, Colors.forestDark]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>

          {!sighting ? (
            <Text style={{ color: "white" }}>Loading...</Text>
          ) : (
            <>
              <Image
                source={{
                  uri: `http://192.168.1.17:5000${sighting.imageUrl}`
                }}
                style={{
                  width: "100%",
                  height: 250,
                  borderRadius: 12
                }}
              />

              <Text style={styles.title}>
                {sighting.species}
              </Text>

              <Text style={styles.meta}>
                WingDex ID: {sighting.id}
              </Text>

              <Text style={styles.meta}>
                Captured: {sighting.timestamp}
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/library')}
                style={styles.btn}
              >
                <Text style={{ color: "white" }}>
                  BACK TO LIBRARY
                </Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 20,
    marginTop: 16,
    fontWeight: "600"
  },
  meta: {
    color: "gray",
    marginTop: 8
  },
  btn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#1a2e1a",
    borderRadius: 8,
    alignItems: "center"
  }
});