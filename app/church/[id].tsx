import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/card';
import { supabase } from '@/services/supabase';

type Church = {
  id: string;
  name: string;
  ein?: string;
  denomination?: string;
  validated?: boolean;
  datetime_created?: string;
  datetime_updated?: string;
  username?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  email?: string;
  description?: string;
};

export default function ChurchDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingChurch, setSavingChurch] = useState(false);

  useEffect(() => {
    loadChurch();
  }, [id]);

  const loadChurch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('church')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setChurch(data as Church);
    } catch (error) {
      console.error('Error loading church:', error);
      Alert.alert('Error', 'Failed to load church details');
    } finally {
      setLoading(false);
    }
  };

  const saveSelectedChurch = async () => {
    if (!church) return;
    
    setSavingChurch(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authErr || !user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('user')
        .update({ selected_church_id: church.id })
        .eq('id', user.id);
      
      if (error) throw error;
      
      Alert.alert('Success', 'Church saved as your primary church');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save church');
    } finally {
      setSavingChurch(false);
    }
  };

  const onGiveNow = async () => {
    if (!church) return;
    
    setSavingChurch(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authErr || !user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('user')
        .update({ selected_church_id: church.id })
        .eq('id', user.id);
      
      if (error) throw error;
      
      router.push({
        pathname: '/(tabs)/give',
        params: { churchId: church.id }
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save selection');
    } finally {
      setSavingChurch(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.safe}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0369A1" />
          <ThemedText style={{ marginTop: 12 }}>Loading church details...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!church) {
    return (
      <ThemedView style={styles.safe}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <ThemedText style={{ marginTop: 12 }}>Church not found</ThemedText>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#0369A1" />
            </Pressable>
          </View>

          {/* Church Name & Status */}
          <View style={styles.titleSection}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.churchName}>{church.name}</ThemedText>
              {church.validated && (
                <Feather name="check-circle" size={20} color="#10b981" />
              )}
            </View>
            {church.denomination && (
              <ThemedText style={styles.denomination}>{church.denomination}</ThemedText>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.primaryButton, savingChurch && styles.buttonDisabled]} 
              onPress={onGiveNow}
              disabled={savingChurch}
            >
              {savingChurch ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="heart" size={18} color="#fff" />
                  <ThemedText style={styles.primaryButtonText}>Give Now</ThemedText>
                </>
              )}
            </Pressable>

            <Pressable 
              style={[styles.secondaryButton, savingChurch && styles.buttonDisabled]} 
              onPress={saveSelectedChurch}
              disabled={savingChurch}
            >
              <Feather name="bookmark" size={18} color="#0369A1" />
              <ThemedText style={styles.secondaryButtonText}>Save as My Church</ThemedText>
            </Pressable>
          </View>

          {/* Contact Information */}
          {(church.phone || church.email || church.website) && (
            <Card title="Contact Information" style={styles.card}>
              {church.phone && (
                <View style={styles.infoRow}>
                  <Feather name="phone" size={18} color="#6B7280" />
                  <ThemedText style={styles.infoText}>{church.phone}</ThemedText>
                </View>
              )}
              {church.email && (
                <View style={styles.infoRow}>
                  <Feather name="mail" size={18} color="#6B7280" />
                  <ThemedText style={styles.infoText}>{church.email}</ThemedText>
                </View>
              )}
              {church.website && (
                <View style={styles.infoRow}>
                  <Feather name="globe" size={18} color="#6B7280" />
                  <ThemedText style={styles.infoText}>{church.website}</ThemedText>
                </View>
              )}
            </Card>
          )}

          {/* Address */}
          {(church.address || church.city || church.state || church.zip) && (
            <Card title="Address" style={styles.card}>
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={18} color="#6B7280" />
                <View style={{ flex: 1 }}>
                  {church.address && <ThemedText style={styles.infoText}>{church.address}</ThemedText>}
                  {(church.city || church.state || church.zip) && (
                    <ThemedText style={styles.infoText}>
                      {[church.city, church.state, church.zip].filter(Boolean).join(', ')}
                    </ThemedText>
                  )}
                </View>
              </View>
            </Card>
          )}

          {/* Description */}
          {church.description && (
            <Card title="About" style={styles.card}>
              <ThemedText style={styles.description}>{church.description}</ThemedText>
            </Card>
          )}

          {/* Additional Details */}
          <Card title="Details" style={styles.card}>
            {church.ein && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>EIN:</ThemedText>
                <ThemedText style={styles.detailValue}>{church.ein}</ThemedText>
              </View>
            )}
            {church.username && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Contact:</ThemedText>
                <ThemedText style={styles.detailValue}>{church.username}</ThemedText>
              </View>
            )}
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Status:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {church.validated ? 'Verified ✓' : 'Unverified'}
              </ThemedText>
            </View>
          </Card>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
 safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 96 },
  
  header: { marginBottom: 16 },
  backBtn: { padding: 8, marginLeft: -8 },
  
  titleSection: { marginBottom: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  churchName: { fontSize: 24, fontWeight: '700', flex: 1 },
  denomination: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0369A1',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0369A1',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: { color: '#0369A1', fontWeight: '700', fontSize: 16 },
  buttonDisabled: { opacity: 0.6 },
  
  card: { marginBottom: 16 },
  
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  infoText: { fontSize: 15, color: '#374151', flex: 1 },
  
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },
  
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  detailValue: { fontSize: 14, color: '#374151' },
  
  backButton: { marginTop: 16, backgroundColor: '#0369A1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: '700' },
});
