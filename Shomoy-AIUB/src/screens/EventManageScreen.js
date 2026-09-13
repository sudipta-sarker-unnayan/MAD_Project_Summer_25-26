import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {
  Card,
  Badge,
  InputField,
  PrimaryButton,
  SecondaryButton,
  colors,
  safeNavigate,
} from '../components/index';

import {
  getEvents,
  createEvent,
  publishEvent,
  closeEvent,
  updateDeadline,
} from '../services/eventService';

const DEADLINE_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const TIME_FORMAT = /^([1-9]|1[0-2]):[0-5]\d\s?(AM|PM|am|pm)$/;

export default function EventManageScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    applyDeadline: '',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [deadlineModal, setDeadlineModal] = useState({
    visible: false,
    eventId: null,
    value: '',
  });

  const [savingDeadline, setSavingDeadline] = useState(false);
  const [deadlineError, setDeadlineError] = useState('');

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      console.log('EventManageScreen load error:', e);
      setError('error loading events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};

    const title = form.title.trim();
    if (!title) e.title = 'Title is required.';
    else if (title.length < 3) e.title = 'Title must be at least 3 characters.';
    else if (title.length > 100) e.title = 'Title must be under 100 characters.';

    if (form.description.trim().length > 500) {
      e.description = 'Description must be under 500 characters.';
    }

    const date = form.date.trim();
    if (!date) e.date = 'Date is required.';
    else if (isNaN(Date.parse(date))) {
      e.date = 'Enter a valid date, e.g. August 5, 2026.';
    }

    const time = form.time.trim();
    if (!time) e.time = 'Time is required.';
    else if (!TIME_FORMAT.test(time)) {
      e.time = 'Use format like 6:00 PM.';
    }

    const location = form.location.trim();
    if (!location) e.location = 'Location is required.';
    else if (location.length < 3) e.location = 'Location must be at least 3 characters.';

    const deadline = form.applyDeadline.trim();
    if (deadline) {
      if (!DEADLINE_FORMAT.test(deadline)) {
        e.applyDeadline = 'Use the format YYYY-MM-DDTHH:mm, e.g. 2026-08-05T18:00';
      } else if (new Date(deadline).getTime() <= Date.now()) {
        e.applyDeadline = 'Deadline must be a future date and time.';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      const created = await createEvent(form);
      if (!created) {
        Alert.alert('Failed', 'Failed to create event. Please try again later.');
        return;
      }

      setForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        applyDeadline: '',
      });
      setErrors({});

      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    const res = await publishEvent(id);
    if (!res.success) {
      Alert.alert('Failed', res.message);
      return;
    }
    load();
  };

  const handleClose = async (id) => {
    const res = await closeEvent(id);
    if (!res.success) {
      Alert.alert('Failed', res.message);
      return;
    }
    load();
  };

  const openDeadlineModal = (eventId, currentDeadline) => {
    setDeadlineError('');
    setDeadlineModal({
      visible: true,
      eventId,
      value: currentDeadline || '',
    });
  };

  const closeDeadlineModal = () => {
    setDeadlineError('');
    setDeadlineModal({
      visible: false,
      eventId: null,
      value: '',
    });
  };

  const confirmDeadline = async () => {
    const value = deadlineModal.value.trim();

    if (!value) {
      setDeadlineError('Please enter a new deadline.');
      return;
    }
    if (!DEADLINE_FORMAT.test(value)) {
      setDeadlineError('Use the format YYYY-MM-DDTHH:mm, e.g. 2026-08-10T18:00');
      return;
    }
    if (new Date(value).getTime() <= Date.now()) {
      setDeadlineError('Deadline must be a future date and time.');
      return;
    }
    setDeadlineError('');

    setSavingDeadline(true);

    const res = await updateDeadline(deadlineModal.eventId, value);

    setSavingDeadline(false);

    if (!res.success) {
      Alert.alert('Failed', res.message);
      return;
    }

    closeDeadlineModal();
    load();
  };

  return (
  <ScrollView style={styles.container} 
  contentContainerStyle={styles.content}
   keyboardShouldPersistTaps="handled" 
   showsVerticalScrollIndicator={true} 
   nestedScrollEnabled={true} >

    <TouchableOpacity
      style={styles.newBtn}
      onPress={() => setShowForm(!showForm)}
      accessibilityRole="button"
      accessibilityLabel={showForm ? 'Close form button' : 'Create new event button'}
    >
      <Ionicons
        name={showForm ? 'close' : 'add-circle'}
        size={20}
        color={colors.primary}
      />
      <Text style={styles.newBtnText}>
        {showForm ? 'Close Form' : 'Create New Event'}
      </Text>
    </TouchableOpacity>

    {showForm && (
      <Card>
        <InputField
          label="Title"
          value={form.title}
          onChangeText={t => setField('title', t)}
          error={errors.title}
        />

        <InputField
          label="Description"
          value={form.description}
          onChangeText={t => setField('description', t)}
          multiline
          error={errors.description}
        />

        <InputField
          label="Date (e.g., August 5, 2026)"
          value={form.date}
          onChangeText={t => setField('date', t)}
          error={errors.date}
        />

        <InputField
          label="Time (e.g., 6:00 PM)"
          value={form.time}
          onChangeText={t => setField('time', t)}
          error={errors.time}
        />

        <InputField
          label="Location"
          value={form.location}
          onChangeText={t => setField('location', t)}
          error={errors.location}
        />

        <InputField
          label="Application Deadline (YYYY-MM-DDTHH:mm)"
          value={form.applyDeadline}
          onChangeText={t => setField('applyDeadline', t)}
          placeholder="2026-08-05T18:00"
          error={errors.applyDeadline}
        />

        <PrimaryButton
          title="Create Event"
          onPress={handleCreate}
          loading={saving}
        />
      </Card>
    )}

    <Text style={styles.sectionTitle}>All Events</Text>

    {loading && events.length === 0 && (
      <View style={styles.stateBox}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateText}>Loading events...</Text>
      </View>
    )}

    {!loading && error && (
      <View style={styles.stateBox}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <SecondaryButton title="Try Again" onPress={load} style={{ marginTop: 12 }} />
      </View>
    )}

    {!loading && !error && events.length === 0 && (
      <View style={styles.stateBox}>
        <Text style={styles.stateText}>No events available.</Text>
      </View>
    )}

    {!error && events.map(event => (
      <Card key={event.id}>
        <TouchableOpacity
          onPress={() =>
            safeNavigate(navigation, 'EventDetailAdmin', {
              eventId: event.id,
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`View details for ${event.title} button`}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{event.title}</Text>

              <Text style={styles.meta}>
                {event.date} · {event.location}
              </Text>

              {!!event.applyDeadline && (
                <Text style={styles.deadline}>
                  Deadline: {event.applyDeadline}
                </Text>
              )}
            </View>

            <Badge
              label={event.committeeOpen ? 'open' : 'closed'}
              color={
                event.committeeOpen
                  ? colors.success
                  : colors.textMuted
              }
            />
          </View>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          {!event.committeeOpen ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handlePublish(event.id)}
              accessibilityRole="button"
              accessibilityLabel={`Publish ${event.title} button`}
            >
              <Text style={styles.actionText}>Publish</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleClose(event.id)}
              accessibilityRole="button"
              accessibilityLabel={`Close ${event.title} button`}
            >
              <Text style={styles.actionText}>Close</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              openDeadlineModal(event.id, event.applyDeadline)
            }
            accessibilityRole="button"
            accessibilityLabel={`Reset deadline for ${event.title} button`}
          >
            <Text style={styles.actionText}>Reset Deadline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              safeNavigate(navigation, 'ApplicantReview', {
                eventId: event.id,
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`View applicants for ${event.title} button`}
          >
            <Text style={styles.actionText}>View Applicants</Text>
          </TouchableOpacity>
        </View>
      </Card>
    ))}

    <Modal
      visible={deadlineModal.visible}
      transparent
      animationType="fade"
      onRequestClose={closeDeadlineModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>
            Set New Deadline
          </Text>

          <InputField
            label="Deadline (YYYY-MM-DDTHH:mm)"
            value={deadlineModal.value}
            onChangeText={t => {
              setDeadlineModal(prev => ({ ...prev, value: t }));
              setDeadlineError('');
            }}
            placeholder="2026-08-10T18:00"
            autoFocus
            error={deadlineError}
          />

          <View style={styles.modalActions}>
            <SecondaryButton
              title="Cancel"
              onPress={closeDeadlineModal}
              style={{ flex: 1, marginRight: 8 }}
            />

            <PrimaryButton
              title="Confirm"
              onPress={confirmDeadline}
              loading={savingDeadline}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background},
  content: { padding: 16, paddingBottom: 160, flexGrow: 1, },

  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  newBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  deadline: {
    fontSize: 11,
    color: colors.warning,
    marginTop: 2,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },

  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },

  stateText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },

  errorText: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },

  modalBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },

  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
});