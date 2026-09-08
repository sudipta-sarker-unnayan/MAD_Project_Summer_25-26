import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SkeletonBox } from '../components/Skeleton';
import { Card, Badge, PrimaryButton, SecondaryButton, InputField, colors } from '../components/index';
import { getDrives, donate } from '../services/donationService';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key: 'active', label: 'চলমান' },
  { key: 'completed', label: 'সম্পন্ন' },
];

export default function DonationDriveScreen() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const [modal, setModal] = useState({ visible: false, drive: null, amount: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setDrives(await getDrives());
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  };

  const filtered = drives.filter(d =>
    activeTab === 'active' ? d.status !== 'Completed' : d.status === 'Completed'
  );

  const openModal = (drive) => setModal({ visible: true, drive, amount: '' });
  const closeModal = () => setModal({ visible: false, drive: null, amount: '' });

  const handleDonate = async () => {
    const res = await donate(modal.drive.id, user, modal.amount);
    if (!res.success) {
      Alert.alert('ব্যর্থ হয়েছে', res.message || 'ডোনেশন সম্পন্ন করা যায়নি।');
      return;
    }
    setSubmitting(true);
    setSubmitting(false);
    closeModal();
    Alert.alert('ধন্যবাদ! 🙏', 'আপনার ডোনেশনের জন্য ধন্যবাদ, এটি নথিভুক্ত হয়েছে।');
    load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Donation Drive</Text>
        <Text style={styles.headerSubtitle}>কমিউনিটি ওয়েলফেয়ার উদ্যোগ</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <>
            <SkeletonBox height={130} radius={14} style={{ marginBottom: 12 }} />
            <SkeletonBox height={130} radius={14} style={{ marginBottom: 12 }} />
          </>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="heart-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? 'কোনো চলমান ড্রাইভ নেই' : 'কোনো সম্পন্ন ড্রাইভ নেই'}
            </Text>
          </View>
        ) : (
          filtered.map((drive, index) => {
            const progress = Math.min(100, Math.round(((drive.raisedAmount || 0) / drive.goalAmount) * 100));
            return (
              <Animated.View key={drive.id} entering={FadeInDown.delay(index * 90).duration(350)}>
                <Card>
                  <View style={styles.rowBetween}>
                    <Text style={styles.title}>{drive.title}</Text>
                    <Badge
                      label={drive.status === 'Completed' ? 'সম্পন্ন' : 'চলমান'}
                      color={drive.status === 'Completed' ? colors.success : colors.primary}
                    />
                  </View>

                  {!!drive.description && (
                    <Text style={styles.description} numberOfLines={2}>{drive.description}</Text>
                  )}

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>

                  <View style={styles.progressLabels}>
                    <Text style={styles.raisedText}>৳{(drive.raisedAmount || 0).toLocaleString('bn-BD')} সংগৃহীত</Text>
                    <Text style={styles.goalText}>লক্ষ্য: ৳{drive.goalAmount.toLocaleString('bn-BD')}</Text>
                  </View>

                  <Text style={styles.donorCount}>{drive.donors?.length || 0} জন দান করেছেন</Text>

                  {drive.status !== 'Completed' && (
                    <PrimaryButton
                      title="Donate করুন"
                      onPress={() => openModal(drive)}
                      style={{ marginTop: 12 }}
                    />
                  )}
                </Card>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modal.visible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modal.drive?.title}</Text>
            <InputField
              label="পরিমাণ (৳)"
              value={modal.amount}
              onChangeText={t => setModal(prev => ({ ...prev, amount: t.replace(/[^0-9]/g, '') }))}
              placeholder="যেমন: 500"
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalActions}>
              <SecondaryButton title="বাতিল" onPress={closeModal} style={{ flex: 1, marginRight: 8 }} />
              <PrimaryButton
                title="নিশ্চিত করুন"
                onPress={handleDonate}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 20, paddingTop: 52, paddingBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#A5B4FC', marginTop: 2 },
  tabRow: {
    flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: 16, marginTop: -14,
    borderRadius: 12, padding: 4, borderWidth: 0.5, borderColor: colors.border,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.primary + '15' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  description: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.border, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.success },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  raisedText: { fontSize: 12, fontWeight: '700', color: colors.success },
  goalText: { fontSize: 12, color: colors.textSecondary },
  donorCount: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 13, color: colors.textMuted, marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: colors.white, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  modalActions: { flexDirection: 'row', marginTop: 8 },
});