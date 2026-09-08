import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, InputField, PrimaryButton, SecondaryButton, colors, safeNavigate } from '../components/index';
import { getEventById, updateTrackerStep, updateAnnouncement } from '../services/eventService';

const STEPS = ['Planning', 'Preparation', 'In Progress', 'Completed'];

export default function EventDetailAdminScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const e = await getEventById(eventId);
      if (!e) {
        setError('Event not found. Please check your connection and try again.');
        return;
      }
      setEvent(e);
      setAnnouncement(e?.announcement || '');
    } catch (err) {
      console.log('EventDetailAdminScreen load error:', err);
      setError('Failed to load event information. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(useCallback(() => { load(); }, [eventId]));

  if (loading) {
    return (
      <View style={[styles.container, styles.stateBox]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateText}>Loading event information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.stateBox]}>
        <Text style={styles.errorText}>{error}</Text>
        <SecondaryButton title="Try Again" onPress={load} style={{ marginTop: 12 }} />
      </View>
    );
  }

  if (!event) return <View style={styles.container} />;

  const handleStepChange = async (step) => {
    const res = await updateTrackerStep(eventId, step);
    if (!res.success) {
      Alert.alert('Failed', res.message);
      return;
    }
    load();
  };

  const handleSaveAnnouncement = async () => {
    setSaving(true);
    const res = await updateAnnouncement(eventId, announcement);
    setSaving(false);
    if (!res.success) {
      Alert.alert('Failed', res.message);
      return;
    }
    load();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>{event.date} · {event.location}</Text>

      <Card>
        <Text style={styles.sectionLabel}>Event Status Update</Text>
        <View style={styles.stepRow}>
          {STEPS.map((s, i) => (
            <SecondaryButton
              key={s}
              title={s}
              onPress={() => handleStepChange(i)}
              style={[styles.stepBtn, i === event.trackerStep && styles.stepBtnActive]}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Announcement (can be edited at any time)</Text>
        <InputField
          value={announcement}
          onChangeText={setAnnouncement}
          multiline
          placeholder="Write an announcement for members..."
        />
        <PrimaryButton title="Save" onPress={handleSaveAnnouncement} loading={saving} />
      </Card>

      <SecondaryButton
        title="View Applicants and Select"
        onPress={() => safeNavigate(navigation, 'ApplicantReview', { eventId })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.textSecondary, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10, textTransform: 'uppercase' },
  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepBtn: { flexGrow: 1, paddingVertical: 8 },
  stepBtnActive: { backgroundColor: colors.primary + '15' },
  stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  stateText: { fontSize: 13, color: colors.textMuted, marginTop: 8 },
  errorText: { fontSize: 13, color: colors.danger, textAlign: 'center', paddingHorizontal: 16 },
});