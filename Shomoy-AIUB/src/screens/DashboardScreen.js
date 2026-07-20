import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, Card, colors, safeNavigate } from '../components/index';
import { events, bloodRequests, notifications } from '../data/dummyData';

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

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  let upcomingEvents = [];
  let urgentBlood    = [];
  let unreadNotifs   = 0;

  try {
    upcomingEvents = events.filter(e => e.trackerStep < 3).slice(0, 2);
    urgentBlood    = bloodRequests.filter(b => b.urgency === 'Urgent' && b.status === 'Active');
    unreadNotifs   = notifications.filter(n => !n.read).length;
  } catch (e) {
    console.log('Dashboard data error:', e);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Top Header */}
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => safeNavigate(navigation, 'Notifications')}>
            <View style={styles.notifBtn}>
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadNotifs > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{unreadNotifs}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Member Card */}
        <View style={styles.memberCard}>
          <Avatar name={user?.name} size={52} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.memberName}>{user?.name}</Text>
            <Text style={styles.memberId}>ID: {user?.id}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <Badge label={user?.role || 'Member'} color={user?.role === 'Admin' ? colors.accent : colors.primary} />
              <Badge label={user?.status || 'Active'} color={colors.success} />
            </View>
          </View>
          <TouchableOpacity onPress={() => safeNavigate(navigation, 'DigitalIDCard')}>
            <Ionicons name="id-card-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Total Events" value={events.length} color={colors.primary} />
          <StatCard label="Urgent Blood Requests" value={urgentBlood.length} color={colors.accent} />
          <StatCard label="Notifications" value={unreadNotifs} color={colors.warning} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaGrid}>
          <QuickAction icon="calendar" label="Events" color={colors.primary}
            onPress={() => safeNavigate(navigation, 'Events')} />
          <QuickAction icon="droplet" label="Blood" color={colors.accent}
            onPress={() => safeNavigate(navigation, 'BloodRequest')} />
          <QuickAction icon="search" label="Members" color="#7C3AED"
            onPress={() => safeNavigate(navigation, 'MemberSearch')} />
          <QuickAction icon="chatbubbles" label="Chat" color="#0891B2"
            onPress={() => safeNavigate(navigation, 'Chat')} />
          <QuickAction icon="id-card" label="ID Card" color="#059669"
            onPress={() => safeNavigate(navigation, 'DigitalIDCard')} />
          <QuickAction icon="person" label="Profile" color="#D97706"
            onPress={() => safeNavigate(navigation, 'Profile')} />
        </View>

        {/* Upcoming Events */}
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {upcomingEvents.map(event => (
          <TouchableOpacity key={event.id} onPress={() => safeNavigate(navigation, 'EventDetail', { event })}>
            <Card>
              <View style={styles.eventRow}>
                <View style={[styles.eventIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date} · {event.location}</Text>
                </View>
                {event.committeeOpen && (
                  <Badge label="Open Committee " color={colors.success} />
                )}
              </View>
              {/* Mini tracker */}
              <View style={styles.miniTracker}>
                {['Planning', 'Preparation', 'In Progress', 'Completed'].map((s, i) => (
                  <View key={i} style={styles.miniStep}>
                    <View style={[styles.miniDot, i <= event.trackerStep && styles.miniDotActive]} />
                    <Text style={[styles.miniLabel, i <= event.trackerStep && styles.miniLabelActive]}>{s}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Urgent Blood */}
        {urgentBlood.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Urgent Blood Request 🩸</Text>
            {urgentBlood.map(b => (
              <Card key={b.id} style={styles.bloodCard}>
                <View style={styles.bloodRow}>
                  <View style={styles.bloodBadge}><Text style={styles.bloodGroup}>{b.bloodGroup}</Text></View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.bloodHospital}>{b.hospital}</Text>
                    <Text style={styles.bloodMeta}>{b.requester} · {b.date}</Text>
                  </View>
                  <Badge label="Urgent" color={colors.accent} />
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={colors.accent} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBg: { backgroundColor: colors.primary, padding: 20, paddingTop: 52, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: '#A5B4FC' },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.accent, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notifDotText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  memberCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center' },
  memberName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  memberId: { fontSize: 12, color: '#A5B4FC', marginTop: 2 },
  body: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderWidth: 0.5, borderColor: colors.border },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12, marginTop: 4 },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  qaItem: { width: '30%', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  qaIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  qaLabel: { fontSize: 12, fontWeight: '500', color: colors.textPrimary },
  eventRow: { flexDirection: 'row', alignItems: 'center' },
  eventIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  eventDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  miniTracker: { flexDirection: 'row', marginTop: 14, justifyContent: 'space-between' },
  miniStep: { alignItems: 'center', flex: 1 },
  miniDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginBottom: 4 },
  miniDotActive: { backgroundColor: colors.primary },
  miniLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  miniLabelActive: { color: colors.primary, fontWeight: '600' },
  bloodCard: { borderLeftWidth: 3, borderLeftColor: colors.accent },
  bloodRow: { flexDirection: 'row', alignItems: 'center' },
  bloodBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent + '15', alignItems: 'center', justifyContent: 'center' },
  bloodGroup: { fontSize: 14, fontWeight: '700', color: colors.accent },
  bloodHospital: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  bloodMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginBottom: 32, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.accent + '40' },
  logoutText: { fontSize: 14, fontWeight: '600', color: colors.accent },
});
