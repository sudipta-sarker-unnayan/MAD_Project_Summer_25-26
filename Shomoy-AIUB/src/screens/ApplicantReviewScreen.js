import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, colors } from '../components/index';
import { getEventById, selectApplicants, publishSelection } from '../services/eventService';

export default function ApplicantReviewScreen({ route }) {
  const eventId = route?.params?.eventId;
  const [event, setEvent] = useState(null);
  const [selected, setSelected] = useState([]);
  const [publishing, setPublishing] = useState(false);

  const load = async () => {
    if (!eventId) return;
    const e = await getEventById(eventId);
    setEvent(e);
    setSelected(e ? e.applicants.filter(a => a.status === 'selected').map(a => a.userId) : []);
  };
  useFocusEffect(useCallback(() => { load(); }, [eventId]));

  if (!eventId) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>কোনো ইভেন্ট নির্বাচন করা হয়নি। অনুগ্রহ করে ইভেন্ট ম্যানেজ থেকে আসুন।</Text>
      </View>
    );
  }

  if (!event) return <View style={styles.container} />;

  const toggle = (userId) => {
    setSelected(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handlePublish = async () => {
    setPublishing(true);
    await selectApplicants(eventId, selected);
    await publishSelection(eventId);
    setPublishing(false);
    Alert.alert('সফল', 'নির্বাচন প্রকাশিত হয়েছে, নির্বাচিতরা নোটিফিকেশন পাবেন।');
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
            <TouchableOpacity onPress={() => toggle(item.userId)}>
              <Card style={styles.row}>
                <Ionicons
                  name={isChecked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isChecked ? colors.primary : colors.textMuted}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>আবেদন করেছেন: {new Date(item.appliedAt).toLocaleDateString('bn-BD')}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>কোনো আবেদনকারী নেই।</Text>}
      />
      {event.applicants.length > 0 && (
        <View style={styles.footer}>
          <PrimaryButton
            title={`নির্বাচন প্রকাশ করুন (${selected.length} জন)`}
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
});