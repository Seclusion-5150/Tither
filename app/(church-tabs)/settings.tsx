import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/card';
import { supabase } from '@/services/supabase';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function ChurchSettings() {
  const [loading, setLoading] = useState(true);
  const [churchProfile, setChurchProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('church')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setChurchProfile({ ...data, email: user.email });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load church profile');
    } finally {
      setLoading(false);
    }
  };

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
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Settings</ThemedText>
            <ThemedText style={styles.subtitle}>Manage your church account</ThemedText>
          </View>

          <Card title="Church Information" style={styles.card}>
            {row('Church Name', <ThemedText style={styles.value}>{churchProfile?.name || 'N/A'}</ThemedText>)}
            {row('Email Address', <ThemedText style={styles.value}>{churchProfile?.email || 'N/A'}</ThemedText>)}
            {row('Phone Number', <ThemedText style={styles.value}>{churchProfile?.phone || 'N/A'}</ThemedText>)}
            {row('EIN', <ThemedText style={styles.value}>{churchProfile?.ein || 'N/A'}</ThemedText>)}
            {row('Verified', (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather 
                  name={churchProfile?.validated ? 'check-circle' : 'x-circle'} 
                  size={16} 
                  color={churchProfile?.validated ? '#10b981' : '#ef4444'} 
                />
                <ThemedText style={styles.value}>
                  {churchProfile?.validated ? 'Yes' : 'No'}
                </ThemedText>
              </View>
            ))}

            <Pressable 
              style={styles.primaryButton} 
              onPress={() => Alert.alert('Update Profile', 'Profile update feature coming soon')}
            >
              <ThemedText style={styles.primaryButtonText}>Update Profile</ThemedText>
            </Pressable>
          </Card>

          <Card title="Stripe Connect" style={styles.card}>
            {row('Account ID', (
              <ThemedText style={styles.value}>
                {churchProfile?.stripe_account_id 
                  ? `${churchProfile.stripe_account_id.substring(0, 12)}...` 
                  : 'Not connected'}
              </ThemedText>
            ))}

            {churchProfile?.stripe_account_id && (
              <Pressable 
                style={styles.primaryButtonOutline} 
                onPress={() => Alert.alert('Stripe Dashboard', 'Opening Stripe dashboard...')}
              >
                <ThemedText style={styles.primaryButtonOutlineText}>View Stripe Dashboard</ThemedText>
              </Pressable>
            )}
          </Card>

          <Card title="Help & Support" style={styles.card}>
            <Pressable 
              style={styles.linkRow} 
              onPress={() => Alert.alert('Help', 'Help center coming soon')}
            >
              <ThemedText style={styles.label}>Help center and support</ThemedText>
              <Feather name="chevron-right" size={18} color="#6B7280" />
            </Pressable>
          </Card>

          <Card style={styles.card}>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
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
  header: { marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  card: { marginBottom: 16 },
  row: { 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 16, fontWeight: '600', color: '#111827' },
  primaryButton: { 
    marginTop: 8, 
    backgroundColor: '#0369A1', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  primaryButtonOutline: { 
    marginTop: 12, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E6E6E9', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  primaryButtonOutlineText: { color: '#0369A1', fontWeight: '700' },
  linkRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    paddingHorizontal: 8, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#E6E6E9' 
  },
  logoutButton: { 
    backgroundColor: '#ffebeb', 
    borderRadius: 10, 
    paddingVertical: 12, 
    alignItems: 'center' 
  },
  logoutText: { color: '#b91c1c', fontWeight: '700' },
});
