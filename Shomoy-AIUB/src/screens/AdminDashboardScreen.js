import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { Avatar, Badge, Card, colors, safeNavigate } from '../components/index';
import { members, bloodRequests } from '../data/dummyData';
import { getEvents } from '../services/eventService';

const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.qaItem} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.qaIcon, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.qaLabel}>{label}</Text>
  </TouchableOpacity>
);

const StatCard = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function AdminDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useAppData();
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);

  const loadEvents = useCallback(async () => {
    setEvents(await getEvents());
  }, []);

  useFocusEffect(useCallback(() => { loadEvents(); }, [loadEvents]));

  const activeMembers   = useMemo(() => members.filter(m => m.role !== 'Admin'), []);
  const openCommittees  = useMemo(() => events.filter(e => e.committeeOpen), [events]);
  const activeBloodReqs = useMemo(() => bloodRequests.filter(b => b.status === 'Active'), []);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents().finally(() => setRefreshing(false));
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>অ্যাডমিন প্যানেল</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => safeNavigate(navigation, 'Notifications')}>
            <View style={styles.notifBtn}>
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.adminCard}>
          <Avatar name={user?.name} size={52} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.adminName}>{user?.name}</Text>
            <Text style={styles.adminId}>ID: {user?.id}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <Badge label="Admin" color={colors.accent} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(0).duration(400)} style={{ flex: 1 }}>
            <StatCard label="মোট সদস্য" value={activeMembers.length} color={colors.primary} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flex: 1 }}>
            <StatCard label="খোলা কমিটি" value={openCommittees.length} color={colors.warning} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flex: 1 }}>
            <StatCard label="ব্লাড রিকোয়েস্ট" value={activeBloodReqs.length} color={colors.accent} />
          </Animated.View>
        </View>

        <Text style={styles.sectionTitle}>অ্যাডমিন অ্যাকশন</Text>
        <View style={styles.qaGrid}>
          <QuickAction icon="add-circle" label="নতুন ইভেন্ট"   color={colors.primary}      onPress={() => safeNavigate(navigation, 'EventManage')} />
          <QuickAction icon="people"     label="আবেদনকারী"     color="#7C3AED"             onPress={() => safeNavigate(navigation, 'ApplicantReview')} />
          <QuickAction icon="droplet"    label="ব্লাড অনুরোধ"  color={colors.accent}       onPress={() => safeNavigate(navigation, 'BloodRequest')} />
          <QuickAction icon="person-circle" label="মেম্বার তালিকা" color="#059669"          onPress={() => safeNavigate(navigation, 'MemberSearch')} />
          <QuickAction icon="megaphone"  label="ঘোষণা"         color="#D97706"             onPress={() => safeNavigate(navigation, 'EventManage')} />
          <QuickAction icon="settings"   label="প্রোফাইল"      color={colors.textSecondary} onPress={() => safeNavigate(navigation, 'Profile')} />
        </View>

        <Text style={styles.sectionTitle}>ইভেন্ট নিয়ন্ত্রণ</Text>
        {events.map((event, index) => (
          <Animated.View key={event.id} entering={FadeInDown.delay(index * 100).duration(400)}>
            <TouchableOpacity onPress={() => safeNavigate(navigation, 'EventManage', { event })}>
              <Card>
                <View style={styles.eventRow}>
                  <View style={[styles.eventIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="calendar" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{event.date} · {event.location}</Text>
                  </View>
                  <Badge
                    label={event.committeeOpen ? 'কমিটি খোলা' : 'বন্ধ'}
                    color={event.committeeOpen ? colors.success : colors.textMuted}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={colors.accent} />
          <Text style={styles.logoutText}>লগআউট</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBg: { backgroundColor: '#1E1B4B', padding: 20, paddingTop: 52, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: '#A5B4FC' },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.accent, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notifDotText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  adminCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center' },
  adminName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  adminId: { fontSize: 12, color: '#A5B4FC', marginTop: 2 },
  body: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderWidth: 0.5, borderColor: colors.border },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12, marginTop: 4 },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  qaItem: { width: '30%', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  qaIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  qaLabel: { fontSize: 11, fontWeight: '500', color: colors.textPrimary, textAlign: 'center' },
  eventRow: { flexDirection: 'row', alignItems: 'center' },
  eventIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  eventDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginBottom: 32, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.accent + '40' },
  logoutText: { fontSize: 14, fontWeight: '600', color: colors.accent },
});