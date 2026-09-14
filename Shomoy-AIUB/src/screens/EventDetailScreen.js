import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { SkeletonBox } from '../components/Skeleton';
import { Card, Badge, PrimaryButton, colors, safeNavigate } from '../components/index';
import { getEventById } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Planning', 'Preparation', 'In Progress', 'Completed'];

export default function EventDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const eventId = route.params?.eventId || route.params?.event?.id;

  const [event, setEvent] = useState(route.params?.event || null);
  const [loading, setLoading] = useState(!route.params?.event);
  const [error, setError] = useState(null);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const load = useCallback(async () => {
    if (!eventId) return;
    try {
      setError(null);
      const e = await getEventById(eventId);
      if (!e) throw new Error('Event not found');
      setEvent(e);
    } catch (err) {
      console.log('EventDetailScreen load error:', err.message);
      setError('ইভেন্ট লোড করা যায়নি। ইন্টারনেট/সার্ভার সংযোগ চেক করুন।');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Public REST API call — Open-Meteo (free, no API key required)
  // Shows live Dhaka weather since all club events currently happen on-campus.
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const DHAKA_LAT = 23.8103;
        const DHAKA_LON = 90.4125;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${DHAKA_LAT}&longitude=${DHAKA_LON}&current_weather=true`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
          });
        }
      } catch (e) {
        console.log('Weather API error:', e.message);
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const weatherInfo = (code) => {
    if (code === 0) return { label: 'পরিষ্কার আকাশ', icon: 'sunny-outline' };
    if (code <= 3) return { label: 'আংশিক মেঘলা', icon: 'partly-sunny-outline' };
    if (code <= 48) return { label: 'কুয়াশাচ্ছন্ন', icon: 'cloud-outline' };
    if (code <= 67) return { label: 'বৃষ্টি হতে পারে', icon: 'rainy-outline' };
    if (code <= 82) return { label: 'ভারী বৃষ্টি', icon: 'thunderstorm-outline' };
    return { label: 'ঝড়ো আবহাওয়া', icon: 'thunderstorm-outline' };
  };

  if (error) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <Ionicons name="cloud-offline-outline" size={40} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <PrimaryButton title="আবার চেষ্টা করুন" onPress={load} style={{ marginTop: 16, width: 180 }} />
      </View>
    );
  }

  if (loading || !event) {
    return (
      <View style={styles.container}>
        <View style={{ padding: 16 }}>
          <SkeletonBox height={28} radius={6} style={{ marginBottom: 10 }} />
          <SkeletonBox height={16} radius={6} width="60%" style={{ marginBottom: 20 }} />
          <SkeletonBox height={140} radius={14} />
        </View>
      </View>
    );
  }

  const myApplication = event.applicants?.find(a => a.userId === user?.id);
  const isDeadlinePassed = event.applyDeadline
    ? new Date(event.applyDeadline).getTime() < Date.now()
    : false;
  const canApply =
    event.committeeOpen &&
    !isDeadlinePassed &&
    !myApplication &&
    user?.role === 'Member' &&
    user?.status === 'Active';

  const statusColor = {
    pending: colors.warning,
    selected: colors.success,
    'not-selected': colors.textMuted,
  };
  const statusLabel = {
    pending: 'বিবেচনাধীন',
    selected: 'নির্বাচিত হয়েছেন 🎉',
    'not-selected': 'নির্বাচিত হননি',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>{event.date}{event.time ? ` · ${event.time}` : ''}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.locationText}>{event.location}</Text>
      </View>

      <View style={styles.weatherBox}>
        {weatherLoading ? (
          <SkeletonBox height={20} radius={6} width="70%" />
        ) : weather ? (
          <>
            <Ionicons name={weatherInfo(weather.code).icon} size={18} color={colors.primary} />
            <Text style={styles.weatherText}>
              ঢাকায় বর্তমান তাপমাত্রা {weather.temp}°C · {weatherInfo(weather.code).label}
            </Text>
          </>
        ) : (
          <Text style={styles.weatherUnavailable}>আবহাওয়ার তথ্য এই মুহূর্তে পাওয়া যাচ্ছে না</Text>
        )}
      </View>

      {!!event.description && (
        <Card>
          <Text style={styles.sectionLabel}>বিবরণ</Text>
          <Text style={styles.description}>{event.description}</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.sectionLabel}>অগ্রগতি</Text>
        <View style={styles.trackerRow}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.trackerStep}>
              <View style={[styles.dot, i <= event.trackerStep && styles.dotActive]} />
              <Text style={[styles.stepLabel, i <= event.trackerStep && styles.stepLabelActive]}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {!!event.announcement && (
        <View style={styles.announcementBox}>
          <Ionicons name="megaphone-outline" size={16} color={colors.warning} />
          <Text style={styles.announcementText}>{event.announcement}</Text>
        </View>
      )}

      <Card>
        <Text style={styles.sectionLabel}>কমিটি আবেদন</Text>

        {myApplication ? (
          <View style={styles.appliedRow}>
            <Badge
              label={statusLabel[myApplication.status] || myApplication.status}
              color={statusColor[myApplication.status] || colors.primary}
            />
            <Text style={styles.appliedMeta}>
              আবেদন করেছেন: {new Date(myApplication.appliedAt).toLocaleDateString('bn-BD')}
            </Text>
          </View>
        ) : event.committeeOpen ? (
          isDeadlinePassed ? (
            <Text style={styles.closedText}>আবেদনের সময়সীমা শেষ হয়ে গেছে।</Text>
          ) : (
            <>
              {!!event.applyDeadline && (
                <Text style={styles.deadlineText}>
                  আবেদনের শেষ সময়: {new Date(event.applyDeadline).toLocaleString('bn-BD')}
                </Text>
              )}
              <PrimaryButton
                title="কমিটির জন্য আবেদন করুন"
                onPress={() => safeNavigate(navigation, 'CommitteeApply', { eventId: event.id })}
                disabled={!canApply}
                style={{ marginTop: 10 }}
              />
              {!canApply && (
                <Text style={styles.closedText}>
                  শুধুমাত্র Active Member আবেদন করতে পারবেন।
                </Text>
              )}
            </>
          )
        ) : (
          <Text style={styles.closedText}>বর্তমানে কমিটির আবেদন বন্ধ আছে।</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.textSecondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 16 },
  locationText: { fontSize: 13, color: colors.textSecondary },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textSecondary,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  description: { fontSize: 14, color: colors.textPrimary, lineHeight: 21 },
  trackerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  trackerStep: { alignItems: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border, marginBottom: 6 },
  dotActive: { backgroundColor: colors.primary },
  stepLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },
  announcementBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.warning + '15', borderRadius: 10, padding: 12, marginBottom: 12,
  },
  announcementText: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  appliedRow: { gap: 6 },
  appliedMeta: { fontSize: 12, color: colors.textSecondary },
  deadlineText: { fontSize: 12, color: colors.warning, fontWeight: '600' },
  closedText: { fontSize: 12, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
  weatherBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary + '10', borderRadius: 10, padding: 10, marginBottom: 16,
  },
  weatherText: { fontSize: 12, color: colors.textPrimary, fontWeight: '500' },
  weatherUnavailable: { fontSize: 12, color: colors.textMuted },
  centerBox: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 13, color: colors.textMuted, marginTop: 10, textAlign: 'center' },
});