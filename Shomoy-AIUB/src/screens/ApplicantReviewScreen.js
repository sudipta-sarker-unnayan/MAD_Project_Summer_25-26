import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, SecondaryButton, colors } from '../components/index';
import { getEventById, selectApplicants, publishSelection } from '../services/eventService';

export default function ApplicantReviewScreen({ route }) {
  const eventId = route?.params?.eventId;
  const [event, setEvent] = useState(null);
  const [selected, setSelected] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!eventId) return;
    setError(null);
    setLoading(true);
    try {
      const e = await getEventById(eventId);
      if (!e) {
        setError('applicant data not found. Please check your connection and try again.');
        return;
      }
      setEvent(e);
      setSelected(e.applicants.filter(a => a.status === 'selected').map(a => a.userId));
    } catch (err) {
      console.log('ApplicantReviewScreen load error:', err);
      setError('Failed to load applicant information. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(useCallback(() => { load(); }, [eventId]));

  if (!eventId) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No event selected. Please go to Event Manage to select an event.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.stateBox]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateText}>Loading applicant information...</Text>
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

  const toggle = (userId) => {
    setSelected(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handlePublish = async () => {
    setPublishing(true);
    const selectRes = await selectApplicants(eventId, selected);
    if (!selectRes.success) {
      setPublishing(false);
      Alert.alert('Failed', selectRes.message);
      return;
    }
    const publishRes = await publishSelection(eventId);
    setPublishing(false);
    if (!publishRes.success) {
      Alert.alert('Failed', publishRes.message);
      return;
    }
    Alert.alert('Success', 'Selection published, selected candidates will receive notifications.');
    load();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={event.applicants}
        keyExtractor={a => a.userId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isChecked = selected.includes(item.userId);
          return (
            <TouchableOpacity
              onPress={() => toggle(item.userId)}
              accessibilityRole="checkbox"
              accessibilityLabel={`Select ${item.name}`}
              accessibilityState={{ checked: isChecked }}
            >
              <Card style={styles.row}>
                <Ionicons
                  name={isChecked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isChecked ? colors.primary : colors.textMuted}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>Applied on: {new Date(item.appliedAt).toLocaleDateString('bn-BD')}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No applicants found.</Text>}
      />
      {event.applicants.length > 0 && (
        <View style={styles.footer}>
          <PrimaryButton
            title={`Publish Selection (${selected.length} candidates)`}
            onPress={handlePublish}
            loading={publishing}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  footer: { padding: 16, borderTopWidth: 0.5, borderTopColor: colors.border, backgroundColor: colors.white },
  stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  stateText: { fontSize: 13, color: colors.textMuted, marginTop: 8 },
  errorText: { fontSize: 13, color: colors.danger, textAlign: 'center', paddingHorizontal: 16 },
});