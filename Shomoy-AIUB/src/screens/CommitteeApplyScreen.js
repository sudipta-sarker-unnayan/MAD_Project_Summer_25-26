import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { SkeletonBox } from '../components/Skeleton';
import { Card, PrimaryButton, colors } from '../components/index';
import { getEventById, applyToEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

export default function CommitteeApplyScreen({ route, navigation }) {
  const { user } = useAuth();
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const e = await getEventById(eventId);
    setEvent(e);
    setLoading(false);
  }, [eventId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const alreadyApplied = event?.applicants?.some(a => a.userId === user?.id);

  const handleSubmit = async () => {
    if (!confirmed) {
      Alert.alert('নিশ্চিত করুন', 'আবেদন করার আগে নিচের চেকবক্সে টিক দিন।');
      return;
    }
    setSubmitting(true);
    const res = await applyToEvent(eventId, user);
    setSubmitting(false);

    if (res.success) {
      Alert.alert('সফল', 'আপনার আবেদন জমা হয়েছে। নির্বাচনের ফলাফল নোটিফিকেশনে জানানো হবে।', [
        { text: 'ঠিক আছে', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('ব্যর্থ হয়েছে', res.message || 'আবেদন জমা দেওয়া যায়নি, আবার চেষ্টা করুন।');
    }
  };

  if (loading || !event) {
    return (
      <View style={styles.container}>
        <View style={{ padding: 16 }}>
          <SkeletonBox height={100} radius={14} style={{ marginBottom: 16 }} />
          <SkeletonBox height={140} radius={14} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>{event.date} · {event.location}</Text>
        {!!event.applyDeadline && (
          <Text style={styles.deadline}>
            আবেদনের শেষ সময়: {new Date(event.applyDeadline).toLocaleString('bn-BD')}
          </Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>আবেদনকারীর তথ্য</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>নাম</Text>
          <Text style={styles.infoValue}>{user?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>মেম্বার আইডি</Text>
          <Text style={styles.infoValue}>{user?.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>বিভাগ</Text>
          <Text style={styles.infoValue}>{user?.department || '—'}</Text>
        </View>
      </Card>

      {alreadyApplied ? (
        <View style={styles.appliedBox}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.appliedText}>আপনি ইতিমধ্যে এই ইভেন্টের কমিটির জন্য আবেদন করেছেন।</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setConfirmed(!confirmed)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={confirmed ? 'checkbox' : 'square-outline'}
              size={22}
              color={confirmed ? colors.primary : colors.textMuted}
            />
            <Text style={styles.checkText}>
              আমি নিশ্চিত করছি যে আমি এই ইভেন্টের কমিটিতে সক্রিয়ভাবে কাজ করতে প্রস্তুত।
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title="আবেদন জমা দিন"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!confirmed}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  eventTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  eventMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  deadline: { fontSize: 12, color: colors.warning, fontWeight: '600', marginTop: 8 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textSecondary,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  checkText: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 19 },
  appliedBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.success + '15', borderRadius: 12, padding: 14,
  },
  appliedText: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
});