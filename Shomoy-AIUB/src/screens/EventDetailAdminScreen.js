import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, InputField, PrimaryButton, SecondaryButton, colors, safeNavigate } from '../components/index';
import { getEventById, updateTrackerStep, updateAnnouncement } from '../services/eventService';

const STEPS = ['Planning', 'Preparation', 'In Progress', 'Completed'];

export default function EventDetailAdminScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const e = await getEventById(eventId);
    setEvent(e);
    setAnnouncement(e?.announcement || '');
  };
  useFocusEffect(useCallback(() => { load(); }, [eventId]));

  if (!event) return <View style={styles.container} />;

  const handleStepChange = async (step) => {
    await updateTrackerStep(eventId, step);
    load();
  };

  const handleSaveAnnouncement = async () => {
    setSaving(true);
    await updateAnnouncement(eventId, announcement);
    setSaving(false);
    load();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>{event.date} · {event.location}</Text>

      <Card>
        <Text style={styles.sectionLabel}>ইভেন্টের অবস্থা আপডেট</Text>
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
        <Text style={styles.sectionLabel}>ঘোষণা (যেকোনো সময় এডিট করা যাবে)</Text>
        <InputField
          value={announcement}
          onChangeText={setAnnouncement}
          multiline
          placeholder="সদস্যদের জন্য ঘোষণা লিখুন..."
        />
        <PrimaryButton title="সেভ করুন" onPress={handleSaveAnnouncement} loading={saving} />
      </Card>

      <SecondaryButton
        title="আবেদনকারী দেখুন ও নির্বাচন করুন"
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
});