import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { colors, safeNavigate } from '../components/index';
import { notifications as initialNotifs } from '../data/dummyData';

const typeIcon = { committee: 'people', selected: 'trophy', blood: 'heart', event: 'calendar' };
const typeColor = { committee: colors.primary, selected: colors.success, blood: colors.accent, event: colors.warning };

export default function NotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markRead = (id) => {
    try {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.log('markRead error:', e);
    }
  };

  const handlePress = (item) => {
    try {
      markRead(item.id);
      if (item.type === 'committee' && item.eventId) {
        safeNavigate(navigation, 'Events');
      } else if (item.type === 'selected' && item.groupLink) {
        // expo-linking দিয়ে group chat এ যাওয়া
        safeNavigate(navigation, 'GroupChat', { eventId: item.eventId, title: 'ইভেন্ট গ্রুপ চ্যাট' });
      } else if (item.type === 'blood') {
        safeNavigate(navigation, 'BloodRequest');
      }
    } catch (e) {
      console.log('Notification press error:', e);
    }
  };

  const markAllRead = () => {
    try {
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.log('markAllRead error:', e);
    }
  };

  const unread = notifs.filter(n => !n.read).length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, !item.read && styles.itemUnread]}
      onPress={() => handlePress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: typeColor[item.type] + '18' }]}>
        <Ionicons name={typeIcon[item.type]} size={20} color={typeColor[item.type]} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.title, !item.read && styles.titleUnread]}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{item.time}</Text>

        {/* Action button for "selected" type */}
        {item.type === 'selected' && !item.read && (
          <TouchableOpacity style={styles.joinBtn} onPress={() => handlePress(item)}>
            <Text style={styles.joinBtnText}>গ্রুপে যোগ দিন →</Text>
          </TouchableOpacity>
        )}
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>নোটিফিকেশন</Text>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>সব পড়া হয়েছে</Text>
          </TouchableOpacity>
        )}
      </View>

      {unread > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="notifications" size={14} color={colors.primary} />
          <Text style={styles.unreadBannerText}>{unread}টি নতুন নোটিফিকেশন</Text>
        </View>
      )}

      <FlatList
        data={notifs}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>কোনো নোটিফিকেশন নেই।</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 20, paddingTop: 52, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  markAll: { fontSize: 13, color: '#A5B4FC', fontWeight: '500' },
  unreadBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary + '10', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  unreadBannerText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  list: { padding: 16 },
  item: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: colors.border },
  itemUnread: { backgroundColor: '#EFF6FF', borderColor: colors.primary + '30' },
  iconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 4 },
  titleUnread: { fontWeight: '700' },
  body: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  time: { fontSize: 11, color: colors.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, alignSelf: 'flex-start', marginTop: 4 },
  joinBtn: { marginTop: 8, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  joinBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: colors.textMuted, marginTop: 12 },
});
