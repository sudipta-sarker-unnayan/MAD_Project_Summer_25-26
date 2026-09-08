import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SkeletonBox } from '../components/Skeleton';
import { Card, Badge, colors, safeNavigate } from '../components/index';
import { getEvents } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key: 'upcoming', label: 'চলমান' },
  { key: 'completed', label: 'সম্পন্ন' },
];

export default function EventsListScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const load = useCallback(async () => {
    const all = await getEvents();
    setEvents(all);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  };

  const filtered = events
    .filter(e => (activeTab === 'upcoming' ? e.trackerStep < 3 : e.trackerStep === 3))
    .sort((a, b) => (activeTab === 'upcoming' ? a.trackerStep - b.trackerStep : 0));

  const hasApplied = (event) => event.applicants?.some(a => a.userId === user?.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <Text style={styles.headerSubtitle}>সব ইভেন্ট এক জায়গায়</Text>
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
        style={styles.list}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <>
            <SkeletonBox height={90} radius={14} style={{ marginBottom: 12 }} />
            <SkeletonBox height={90} radius={14} style={{ marginBottom: 12 }} />
            <SkeletonBox height={90} radius={14} style={{ marginBottom: 12 }} />
          </>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'কোনো চলমান ইভেন্ট নেই' : 'কোনো সম্পন্ন ইভেন্ট নেই'}
            </Text>
          </View>
        ) : (
          filtered.map((event, index) => (
            <Animated.View key={event.id} entering={FadeInDown.delay(index * 80).duration(350)}>
              <TouchableOpacity
                onPress={() => safeNavigate(navigation, 'EventDetail', { eventId: event.id })}
                activeOpacity={0.85}
              >
                <Card>
                  <View style={styles.row}>
                    <View style={styles.iconBox}>
                      <Ionicons name="calendar" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
                      <Text style={styles.meta}>{event.date} · {event.location}</Text>
                    </View>
                  </View>

                  <View style={styles.badgeRow}>
                    {activeTab === 'upcoming' && (
                      <Badge
                        label={event.committeeOpen ? 'কমিটির আবেদন খোলা' : 'আবেদন বন্ধ'}
                        color={event.committeeOpen ? colors.success : colors.textMuted}
                      />
                    )}
                    {hasApplied(event) && (
                      <Badge label="আবেদন করা হয়েছে" color={colors.primaryLight} />
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 52,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#A5B4FC', marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 12,
    padding: 4,
    borderWidth: 0.5,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.primary + '15' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 13, color: colors.textMuted, marginTop: 10 },
});