import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card, Badge, colors } from '../components/index';
import { bloodRequests, members } from '../data/dummyData';

const TABS = [
  { key: 'Active', label: 'সক্রিয়' },
  { key: 'Fulfilled', label: 'পূরণ হয়েছে' },
];

const BLOOD_GROUPS = ['সব', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodRequestScreen() {
  const [activeTab, setActiveTab] = useState('Active');
  const [groupFilter, setGroupFilter] = useState('সব');

  const filtered = useMemo(() => {
    return bloodRequests
      .filter(b => b.status === activeTab)
      .filter(b => groupFilter === 'সব' || b.bloodGroup === groupFilter)
      .sort((a, b) => (a.urgency === 'Urgent' ? -1 : 1));
  }, [activeTab, groupFilter]);

  const handleContact = (requesterName) => {
    const member = members.find(m => m.name === requesterName);
    if (!member?.phone) {
      Alert.alert('যোগাযোগের তথ্য নেই', 'এই অনুরোধকারীর ফোন নম্বর পাওয়া যায়নি।');
      return;
    }
    Alert.alert(
      member.name,
      member.phone,
      [
        { text: 'বাতিল', style: 'cancel' },
        { text: 'কল করুন', onPress: () => Linking.openURL(`tel:${member.phone}`) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blood Request</Text>
        <Text style={styles.headerSubtitle}>রক্তদানের মাধ্যমে জীবন বাঁচান</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {BLOOD_GROUPS.map(group => (
          <TouchableOpacity
            key={group}
            style={[styles.chip, groupFilter === group && styles.chipActive]}
            onPress={() => setGroupFilter(group)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, groupFilter === group && styles.chipTextActive]}>
              {group}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="water-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>কোনো রক্তের অনুরোধ পাওয়া যায়নি</Text>
          </View>
        ) : (
          filtered.map((req, index) => (
            <Animated.View key={req.id} entering={FadeInDown.delay(index * 80).duration(350)}>
              <Card style={req.urgency === 'Urgent' ? styles.urgentCard : undefined}>
                <View style={styles.row}>
                  <View style={styles.groupBadge}>
                    <Text style={styles.groupText}>{req.bloodGroup}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.hospital}>{req.hospital}</Text>
                    <Text style={styles.meta}>{req.requester} · {req.date}</Text>
                  </View>
                  {req.urgency === 'Urgent' && req.status === 'Active' && (
                    <Badge label="জরুরি" color={colors.accent} />
                  )}
                </View>

                {req.status === 'Active' && (
                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => handleContact(req.requester)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call-outline" size={16} color={colors.primary} />
                    <Text style={styles.contactText}>যোগাযোগ করুন</Text>
                  </TouchableOpacity>
                )}
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 20, paddingTop: 52, paddingBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#A5B4FC', marginTop: 2 },
  tabRow: {
    flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: 16, marginTop: -14,
    borderRadius: 12, padding: 4, borderWidth: 0.5, borderColor: colors.border,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.primary + '15' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  chipScroll: { marginTop: 14, marginBottom: 4, flexGrow: 0 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center' },
  urgentCard: { borderLeftWidth: 3, borderLeftColor: colors.accent },
  groupBadge: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  groupText: { fontSize: 14, fontWeight: '700', color: colors.accent },
  hospital: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 12, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1, borderColor: colors.primary,
  },
  contactText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 13, color: colors.textMuted, marginTop: 10 },
});