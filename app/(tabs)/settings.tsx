import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/services/supabase';

export default function SettingsScreen() {
  const [autoPay, setAutoPay] = useState(true);
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [monthlyStatements, setMonthlyStatements] = useState(true);
  const [defaultAmount, setDefaultAmount] = useState('20');
  const [frequency, setFrequency] = useState('Weekly');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out');
      return;
    }
    router.replace('/(auth)/login');
  };

  const row = (label: string, right: React.ReactNode) => (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {right}
    </View>
  );

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Settings</ThemedText>
            <ThemedText style={styles.subtitle}>Manage your account & preferences</ThemedText>
          </View>

          <Card title="Profile Information" style={styles.card}>
            {row('Full Name', <ThemedText style={styles.value}>John Smith</ThemedText>)}
            {row('Email Address', <ThemedText style={styles.value}>john.smith@email.com</ThemedText>)}
            {row('Phone Number', <ThemedText style={styles.value}>+1 (555) 123-4567</ThemedText>)}

            <Pressable style={styles.primaryButton} onPress={() => Alert.alert('Update Profile', 'Profile update flow here')} accessibilityRole="button">
              <ThemedText style={styles.primaryButtonText}>Update Profile</ThemedText>
            </Pressable>
          </Card>

          <Card title="Giving Preferences" style={styles.card}>
            <View style={styles.formRow}>
              <ThemedText style={styles.label}>Default Tithe Amount</ThemedText>
              <TextInput
                value={defaultAmount}
                onChangeText={setDefaultAmount}
                style={styles.inputInline}
                keyboardType="numeric"
                accessibilityLabel="Default amount"
              />
            </View>

            <View style={styles.formRow}>
              <ThemedText style={styles.label}>Giving Frequency</ThemedText>
              <Pressable style={styles.select} onPress={() => Alert.alert('Frequency', 'Open frequency picker')} accessibilityRole="button">
                <ThemedText style={styles.value}>{frequency}</ThemedText>
                <Feather name="chevron-right" size={18} color="#6B7280" />
              </Pressable>
            </View>

            <View style={styles.toggleBlock}>
              <ThemedText style={styles.label}>Auto-pay enabled</ThemedText>
              <View style={styles.toggleRow}>
                <ThemedText style={styles.smallText}>Auto charges to preferred method</ThemedText>
                <Switch value={autoPay} onValueChange={setAutoPay} accessibilityLabel="Toggle auto pay" />
              </View>
            </View>
          </Card>

          <Card title="Payment Methods" style={styles.card}>
            <View style={styles.cardRow}>
              <View>
                <ThemedText style={styles.label}>Visa ending in 4242</ThemedText>
                <ThemedText style={styles.smallText}>Expires 07/26</ThemedText>
              </View>

              <Pressable onPress={() => Alert.alert('Edit card', 'Card edit flow here')} style={styles.ghostButton} accessibilityRole="button">
                <ThemedText style={styles.ghostText}>Edit</ThemedText>
              </Pressable>
            </View>

            <Pressable onPress={() => Alert.alert('Add payment', 'Add payment method flow')} style={styles.primaryButtonOutline} accessibilityRole="button">
              <ThemedText style={styles.primaryButtonOutlineText}>Add New Payment Method</ThemedText>
            </Pressable>
          </Card>

          <Card title="Notifications" style={styles.card}>
            <View style={styles.switchRowSimple}>
              <ThemedText style={styles.label}>Payment Confirmations</ThemedText>
              <Switch value={notifyPayments} onValueChange={setNotifyPayments} accessibilityLabel="Toggle payment confirmations" />
            </View>

            <View style={styles.switchRowSimple}>
              <ThemedText style={styles.label}>Giving Reminders</ThemedText>
              <Switch value={reminders} onValueChange={setReminders} accessibilityLabel="Toggle giving reminders" />
            </View>

            <View style={styles.switchRowSimple}>
              <ThemedText style={styles.label}>Monthly Statements</ThemedText>
              <Switch value={monthlyStatements} onValueChange={setMonthlyStatements} accessibilityLabel="Toggle monthly statements" />
            </View>
          </Card>

          <Card title="Security & Privacy" style={styles.card}>
            <Pressable style={styles.linkRow} onPress={() => Alert.alert('Privacy', 'Show privacy information')} accessibilityRole="button">
              <ThemedText style={styles.label}>See how we protect your data</ThemedText>
              <Feather name="chevron-right" size={18} color="#6B7280" />
            </Pressable>
          </Card>

          <Card title="Help & Support" style={styles.card}>
            <Pressable style={styles.linkRow} onPress={() => Alert.alert('Help', 'Open help center')} accessibilityRole="button">
              <ThemedText style={styles.label}>Help center and contact options</ThemedText>
              <Feather name="chevron-right" size={18} color="#6B7280" />
            </Pressable>
          </Card>

          <Card style={styles.card}>
            <Pressable onPress={handleLogout} style={styles.logoutButton} accessibilityRole="button" accessibilityLabel="Log out">
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </Pressable>
          </Card>

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 96 },

  header: { marginBottom: 10, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  card: { marginBottom: 12 },

  row: { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 16, fontWeight: '600', color: '#111827' },

  primaryButton: { marginTop: 8, backgroundColor: '#0369A1', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },

  primaryButtonOutline: { marginTop: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E6E9', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryButtonOutlineText: { color: '#0369A1', fontWeight: '700' },

  formRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  inputInline: { width: 100, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E6E6E9', textAlign: 'center' },

  select: { flexDirection: 'row', alignItems: 'center' },

  toggleBlock: { marginTop: 8 },
  toggleRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  smallText: { fontSize: 13, color: '#6B7280' },

  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  ghostButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E6E9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  ghostText: { color: '#0369A1', fontWeight: '700' },

  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E6E6E9' },

  logoutButton: { backgroundColor: '#ffebeb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#b91c1c', fontWeight: '700' },

  switchRowSimple: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
});
