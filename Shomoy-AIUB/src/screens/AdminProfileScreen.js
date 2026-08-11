import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, Card, colors, safeNavigate } from '../components/index';

const MenuItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.menuIcon, { backgroundColor: (danger ? colors.accent : colors.primary) + '12' }]}>
      <Ionicons name={icon} size={18} color={danger ? colors.accent : colors.primary} />
    </View>
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </TouchableOpacity>
);

export default function AdminProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBg}>
        <Avatar name={user?.name} size={80} style={styles.avatar} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.memberId}>{user?.id}</Text>
        <View style={styles.badgeRow}>
          <Badge label="Admin" color={colors.accent} />
          <Badge label="সিস্টেম নিয়ন্ত্রক" color={colors.primary} style={{ marginLeft: 8 }} />
        </View>
      </View>

      <View style={styles.body}>
        {/* Admin panel — সবচেয়ে গুরুত্বপূর্ণ সেকশন, সবার উপরে */}
        <Text style={styles.sectionTitle}>অ্যাডমিন প্যানেল</Text>
        <Card style={{ padding: 4 }}>
          <MenuItem icon="calendar"       label="ইভেন্ট ও কমিটি ম্যানেজ"   onPress={() => safeNavigate(navigation, 'EventManage')} />
          <MenuItem icon="people"         label="আবেদনকারী পর্যালোচনা"     onPress={() => safeNavigate(navigation, 'EventManage')} />
          <MenuItem icon="droplet"        label="ব্লাড রিকোয়েস্ট ওভারভিউ" onPress={() => safeNavigate(navigation, 'BloodRequest')} />
          <MenuItem icon="person-circle"  label="মেম্বার ম্যানেজমেন্ট"    onPress={() => safeNavigate(navigation, 'MemberSearch')} />
        </Card>

        <Text style={styles.sectionTitle}>অ্যাকাউন্ট</Text>
        <Card style={{ padding: 4 }}>
          <MenuItem icon="person-outline"      label="প্রোফাইল সম্পাদনা"   onPress={() => safeNavigate(navigation, 'EditProfile')} />
          <MenuItem icon="lock-closed-outline" label="পাসওয়ার্ড পরিবর্তন" onPress={() => safeNavigate(navigation, 'ChangePassword')} />
          <MenuItem icon="id-card-outline"     label="ডিজিটাল আইডি কার্ড" onPress={() => safeNavigate(navigation, 'DigitalIDCard')} />
        </Card>

        <Text style={styles.sectionTitle}> </Text>
        <Card style={{ padding: 4 }}>
          <MenuItem icon="log-out-outline" label="লগআউট" onPress={logout} danger />
        </Card>

        <Text style={styles.footer}>AIUB Social Welfare Club – শময় Admin · v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBg: { backgroundColor: '#1E1B4B', alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  avatar: { marginBottom: 14, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  memberId: { fontSize: 13, color: '#A5B4FC', marginBottom: 12 },
  badgeRow: { flexDirection: 'row' },
  body: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  menuLabelDanger: { color: colors.accent },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 20, marginBottom: 32 },
});