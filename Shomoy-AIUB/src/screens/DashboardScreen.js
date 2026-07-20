import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SkeletonBox } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, Card, colors } from '../components/index';
import { events, bloodRequests, notifications } from '../data/dummyData';
import { sendLocalNotification } from '../utils/notify';

const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity
    style={styles.qaItem}
    onPress={onPress}
    activeOpacity={0.8}
  >
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

  const upcomingEvents = events
    .filter((e) => e.trackerStep < 3)
    .slice(0, 2);

  const urgentBlood = bloodRequests.filter(
    (b) => b.urgency === 'Urgent' && b.status === 'Active'
  );

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const notifiedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (urgentBlood.length > 0 && !notifiedRef.current) {
      notifiedRef.current = true;
      sendLocalNotification(
        'Urgent Blood Request 🩸',
        `${urgentBlood[0].bloodGroup} needed at ${urgentBlood[0].hospital}`
      );
    }
  }, [urgentBlood]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* Top Header */}
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello</Text>
            <Text style={styles.userName}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.notifBtn}>
              <Ionicons name="notifications" size={22} color="#fff" />

              {unreadNotifs > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>
                    {unreadNotifs}
                  </Text>
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

            <View
              style={{
                flexDirection: 'row',
                gap: 6,
                marginTop: 6,
              }}
            >
              <Badge
                label={user?.role || 'Member'}
                color={
                  user?.role === 'Admin'
                    ? colors.accent
                    : colors.primary
                }
              />

              <Badge
                label={user?.status || 'Active'}
                color={colors.success}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('DigitalIDCard')}
          >
            <Ionicons
              name="id-card-outline"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {loading ? (
          <>
            <SkeletonBox
              height={80}
              radius={12}
              style={{ marginBottom: 16 }}
            />
            <SkeletonBox
              height={60}
              radius={12}
              style={{ marginBottom: 10 }}
            />
            <SkeletonBox
              height={60}
              radius={12}
              style={{ marginBottom: 10 }}
            />
          </>
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <Animated.View
                entering={FadeInDown.delay(0).duration(400)}
                style={{ flex: 1 }}
              >
                <StatCard
                  label="Total Events"
                  value={events.length}
                  color={colors.primary}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(100).duration(400)}
                style={{ flex: 1 }}
              >
                <StatCard
                  label="Urgent Blood Requests"
                  value={urgentBlood.length}
                  color={colors.accent}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(200).duration(400)}
                style={{ flex: 1 }}
              >
                <StatCard
                  label="Notifications"
                  value={unreadNotifs}
                  color={colors.warning}
                />
              </Animated.View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.qaGrid}>
              <QuickAction
                icon="calendar"
                label="Events"
                color={colors.primary}
                onPress={() => navigation.navigate('Events')}
              />

              <QuickAction
                icon="droplet"
                label="Blood"
                color={colors.accent}
                onPress={() =>
                  navigation.navigate('BloodRequest')
                }
              />

              <QuickAction
                icon="search"
                label="Members"
                color="#7C3AED"
                onPress={() =>
                  navigation.navigate('MemberSearch')
                }
              />

              <QuickAction
                icon="chatbubbles"
                label="Chat"
                color="#0891B2"
                onPress={() => navigation.navigate('Chat')}
              />

              <QuickAction
                icon="id-card"
                label="ID Card"
                color="#059669"
                onPress={() =>
                  navigation.navigate('DigitalIDCard')
                }
              />

              <QuickAction
                icon="person"
                label="Profile"
                color="#D97706"
                onPress={() => navigation.navigate('Profile')}
              />
            </View>

            {/* Upcoming Events */}
            <Text style={styles.sectionTitle}>Upcoming Events</Text>

            {upcomingEvents.map((event, index) => (
              <Animated.View
                key={event.id}
                entering={FadeInDown.delay(index * 100).duration(400)}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('EventDetail', {
                      event,
                    })
                  }
                >
                  <Card>
                    <View style={styles.eventRow}>
                      <View
                        style={[
                          styles.eventIcon,
                          {
                            backgroundColor:
                              colors.primary + '15',
                          },
                        ]}
                      >
                        <Ionicons
                          name="calendar"
                          size={20}
                          color={colors.primary}
                        />
                      </View>

                      <View
                        style={{ flex: 1, marginLeft: 12 }}
                      >
                        <Text style={styles.eventTitle}>
                          {event.title}
                        </Text>
                        <Text style={styles.eventDate}>
                          {event.date} · {event.location}
                        </Text>
                      </View>

                      {event.committeeOpen && (
                        <Badge
                          label="Open Committee"
                          color={colors.success}
                        />
                      )}
                    </View>

                    {/* Mini tracker */}
                    <View style={styles.miniTracker}>
                      {[
                        'Planning',
                        'Preparation',
                        'In Progress',
                        'Completed',
                      ].map((step, i) => (
                        <View
                          key={i}
                          style={styles.miniStep}
                        >
                          <View
                            style={[
                              styles.miniDot,
                              i <= event.trackerStep &&
                                styles.miniDotActive,
                            ]}
                          />

                          <Text
                            style={[
                              styles.miniLabel,
                              i <= event.trackerStep &&
                                styles.miniLabelActive,
                            ]}
                          >
                            {step}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {/* Urgent Blood */}
            {urgentBlood.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Urgent Blood Request 🩸
                </Text>

                {urgentBlood.map((b, index) => (
                  <Animated.View
                    key={b.id}
                    entering={FadeInDown.delay(index * 100).duration(400)}
                  >
                    <Card style={styles.bloodCard}>
                      <View style={styles.bloodRow}>
                        <View style={styles.bloodBadge}>
                          <Text style={styles.bloodGroup}>
                            {b.bloodGroup}
                          </Text>
                        </View>

                        <View
                          style={{
                            flex: 1,
                            marginLeft: 12,
                          }}
                        >
                          <Text
                            style={styles.bloodHospital}
                          >
                            {b.hospital}
                          </Text>

                          <Text style={styles.bloodMeta}>
                            {b.requester} · {b.date}
                          </Text>
                        </View>

                        <Badge
                          label="Urgent"
                          color={colors.accent}
                        />
                      </View>
                    </Card>
                  </Animated.View>
                ))}
              </>
            )}

            {/* Logout */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={logout}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.accent}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBg: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 52,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: '#A5B4FC',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDotText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
  memberCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  memberId: {
    fontSize: 12,
    color: '#A5B4FC',
    marginTop: 2,
  },
  body: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  qaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  qaItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  qaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qaLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  eventDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  miniTracker: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'space-between',
  },
  miniStep: {
    alignItems: 'center',
    flex: 1,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  miniDotActive: {
    backgroundColor: colors.primary,
  },
  miniLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  miniLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  bloodCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  bloodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodGroup: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  bloodHospital: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bloodMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 32,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
});