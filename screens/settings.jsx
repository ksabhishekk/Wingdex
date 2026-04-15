import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Radii, Spacing } from '../theme';

export default function SettingsScreen() {
  const router = useRouter();
  
  const [locationOn, setLocationOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [notifsOn, setNotifsOn] = useState(false);
  const [contributeOn, setContributeOn] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => router.replace('/') }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your WingDex data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive" }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert("WingDex", "Version 1.0.0\nBuilt for bird watchers.");
  };

  const renderSectionHeader = (title) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderRow = (title, subtitle, rightElement, onPress = null, isLast = false) => {
    const RowComponent = onPress ? TouchableOpacity : View;
    return (
      <RowComponent style={[styles.row, !isLast && styles.rowBorder]} onPress={onPress} activeOpacity={0.7} key={title}>
        <View style={styles.rowLeft}>
          <Text style={styles.rowTitle}>{title}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.rowRight}>
          {rightElement}
        </View>
      </RowComponent>
    );
  };

  const renderArrow = () => <Text style={styles.arrowText}>›</Text>;

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.screenBg, Colors.forestDark]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerBtn}>◀ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: Spacing.md }} showsVerticalScrollIndicator={false}>
        
        {renderSectionHeader('PERMISSIONS')}
        <View style={styles.cardGroup}>
          {renderRow('Location Access', 'Used for sighting heatmaps', 
            <Switch value={locationOn} onValueChange={setLocationOn} trackColor={{ false: 'rgba(80,80,80,0.4)', true: Colors.dexRed }} thumbColor={Colors.cream} />
          )}
          {renderRow('Camera Access', 'Required for bird capture', 
            <Switch value={cameraOn} onValueChange={setCameraOn} trackColor={{ false: 'rgba(80,80,80,0.4)', true: Colors.dexRed }} thumbColor={Colors.cream} />
          )}
          {renderRow('Notifications', 'Rare species spotted near you', 
            <Switch value={notifsOn} onValueChange={setNotifsOn} trackColor={{ false: 'rgba(80,80,80,0.4)', true: Colors.dexRed }} thumbColor={Colors.cream} />, null, true
          )}
        </View>

        {renderSectionHeader('PRIVACY')}
        <View style={styles.cardGroup}>
          {renderRow('Contribute Sightings', 'Anonymously add to public heatmap', 
            <Switch value={contributeOn} onValueChange={setContributeOn} trackColor={{ false: 'rgba(80,80,80,0.4)', true: Colors.dexRed }} thumbColor={Colors.cream} />
          )}
          {renderRow('Privacy Policy', null, renderArrow(), () => {})}
          {renderRow('Terms of Service', null, renderArrow(), () => {}, true)}
        </View>

        {renderSectionHeader('ACCOUNT')}
        <View style={styles.cardGroup}>
          {renderRow('trainer@wingdex.app', 'Signed in via Email', renderArrow(), () => {})}
          {renderRow('Change Password', null, renderArrow(), () => {})}
          {renderRow('Delete Account', null, renderArrow(), handleDelete, true)}
        </View>

        {renderSectionHeader('ABOUT')}
        <View style={styles.cardGroup}>
          {renderRow('About WingDex', 'Version 1.0.0', renderArrow(), handleAbout)}
          {renderRow('Send Feedback', null, renderArrow(), () => {})}
          {renderRow('Rate the App', null, renderArrow(), () => {}, true)}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>▶ LOG OUT</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>WingDex — Built for bird watchers.{'\n'}© 2025 WingDex Inc.</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    zIndex: 20
  },
  headerBtn: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.sage
  },
  headerTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: Colors.cream
  },
  sectionHeader: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: 'rgba(74,106,74,0.9)',
    letterSpacing: 1.5,
    marginTop: Spacing.lg,
    marginBottom: 8,
    paddingHorizontal: 4
  },
  cardGroup: {
    backgroundColor: 'rgba(26,46,26,0.45)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(90,120,60,0.13)',
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(90,120,60,0.08)'
  },
  rowLeft: {
    flex: 1
  },
  rowTitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.cream,
    marginBottom: 2
  },
  rowSubtitle: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.mutedGreen
  },
  rowRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10
  },
  arrowText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.mutedGreen
  },
  logoutBtn: {
    backgroundColor: 'rgba(204,41,41,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(204,41,41,0.28)',
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 30
  },
  logoutText: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.dexRed
  },
  footerText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.mutedGreen,
    textAlign: 'center',
    lineHeight: 16
  }
});
