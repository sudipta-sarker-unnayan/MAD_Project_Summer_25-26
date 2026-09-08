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

  const [deadlineModal, setDeadlineModal] = useState({
    visible: false,
    eventId: null,
    value: '',
  });

  const [savingDeadline, setSavingDeadline] = useState(false);

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

  const handleCreate = async () => {
    if (!form.title || !form.date) {
      Alert.alert('invalid input', 'Title and Date are required.');
      return;
    }

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
    setDeadlineModal({
      visible: true,
      eventId,
      value: currentDeadline || '',
    });
  };

  const closeDeadlineModal = () => {
    setDeadlineModal({
      visible: false,
      eventId: null,
      value: '',
    });
  };

  const confirmDeadline = async () => {
    if (!deadlineModal.value.trim()) {
      Alert.alert(
        'Invalid Input',
        'Please enter a new deadline (e.g., 2026-08-10T18:00)'
      );
      return;
    }

    setSavingDeadline(true);

    const res = await updateDeadline(
      deadlineModal.eventId,
      deadlineModal.value.trim()
    );

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
          onChangeText={t => setForm({ ...form, title: t })}
        />

        <InputField
          label="Description"
          value={form.description}
          onChangeText={t => setForm({ ...form, description: t })}
          multiline
        />

        <InputField
          label="Date (e.g., August 5, 2026)"
          value={form.date}
          onChangeText={t => setForm({ ...form, date: t })}
        />

        <InputField
          label="Time (e.g., 6:00 PM)"
          value={form.time}
          onChangeText={t => setForm({ ...form, time: t })}
        />

        <InputField
          label="Location"
          value={form.location}
          onChangeText={t => setForm({ ...form, location: t })}
        />

        <InputField
          label="Application Deadline (YYYY-MM-DDTHH:mm)"
          value={form.applyDeadline}
          onChangeText={t => setForm({ ...form, applyDeadline: t })}
          placeholder="2026-08-05T18:00"
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
            onChangeText={t =>
              setDeadlineModal(prev => ({ ...prev, value: t }))
            }
            placeholder="2026-08-10T18:00"
            autoFocus
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