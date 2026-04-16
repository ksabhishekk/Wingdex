import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LibraryScreen() {
  const router = useRouter();
  const [sightings, setSightings] = useState([]);

  useEffect(() => {
    loadSightings();
  }, []);

  const loadSightings = async () => {
    try {
      const res = await fetch(
        "http://192.168.1.17:5000/sightings?userId=1"
      );

      const data = await res.json();
      setSightings(data);
    } catch (err) {
      console.log("LIBRARY ERROR:", err);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#0A1208", "#071006"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>

        <Text style={styles.title}>
          YOUR WINGDEX
        </Text>

        <ScrollView>
          {sightings.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/bird-detail",
                  params: {
                    id: s.id   // ✅ IMPORTANT FIX
                  }
                })
              }
            >
              <Text style={{ color: "white", fontSize: 16 }}>
                {s.species}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 18,
    padding: 16
  },
  card: {
    padding: 12,
    margin: 10,
    backgroundColor: "#1a2e1a",
    borderRadius: 8
  }
});