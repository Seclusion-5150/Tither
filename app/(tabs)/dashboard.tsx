import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import Card from '../../components/card';
import Transaction from '../../components/transaction';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

type Tithe = {
  id: string;
  user_id: string;
  church_id: string;
  amount: number;
  status: string;
  stripe_payment_intent_id?: string;
  notes?: string;
  created_at: string;
};

type Church = {
  id: string;
  name?: string;
  denomination?: string;
  address?: string;
  verified?: boolean;
};

export default function Dashboard() {
  const [tithes, setTithes] = useState<Tithe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [thisMonth, setThisMonth] = useState(0);
  const [thisYear, setThisYear] = useState(0);
  const [usualAmount, setUsualAmount] = useState(0);

  // selected church
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [churchLoading, setChurchLoading] = useState(true);

  useFocusEffect(
  React.useCallback(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      setChurchLoading(true);
      try {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        const user = authData?.user;
        if (authErr || !user) {
          setError('Not authenticated');
          return;
        }

        const userId = user.id;
        
        // read selected_church_id preference
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user')
            .select('selected_church_id')
            .eq('id', userId)
            .single();

          if (!profileError) {
            const churchId = profile?.selected_church_id;
            
            if (churchId) {
              const { data: churchData, error: churchError } = await supabase
                .from('church')
                .select('id,name,denomination,address')
                .eq('id', churchId)
                .single();

              if (!churchError && churchData && mounted) {
                setSelectedChurch(churchData as Church);
              }
            } else {
              // No church selected
              if (mounted) setSelectedChurch(null);
            }
          }
        } catch {
          // ignore preference read failure
        }

        // fetch tithes
        const { data, error: tithesError } = await supabase
          .from('tithes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (tithesError) {
          setError('Could not fetch tithes');
          return;
        }

        const list: Tithe[] = data || [];
        if (mounted) setTithes(list);

        // compute summary
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        let monthTotal = 0;
        let yearTotal = 0;
        let lastAmount = 0;

        list.forEach((t) => {
          const d = new Date(t.created_at);
          if (d.getFullYear() === year) {
            yearTotal += t.amount;
            if (d.getMonth() === month) monthTotal += t.amount;
          }
        });

        if (list.length > 0) lastAmount = list[0].amount;

        if (mounted) {
          setThisMonth(monthTotal);
          setThisYear(yearTotal);
          setUsualAmount(lastAmount);
        }
      } catch (e) {
        if (mounted) setError('Unexpected error');
      } finally {
        if (mounted) {
          setLoading(false);
          setChurchLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [])
);

  const onChangeChurch = () => {
    router.push('/(tabs)/find');
  };

  const onGive = () => {
    router.push('/(tabs)/give');
  };

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.welcomeTitle}>Welcome to Tither</ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>Continue your faithful giving</ThemedText>
          </View>

          <Card style={styles.selectedChurchCard}>
            <View style={styles.selectedRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.selectedLabel}>Your Church</ThemedText>
                {churchLoading ? (
                  <ActivityIndicator size="small" />
                ) : selectedChurch ? (
                  <>
                    <ThemedText style={styles.selectedName}>
                      {selectedChurch.name} {selectedChurch.verified ? <Feather name="check-circle" size={14} color="#10b981" /> : null}
                    </ThemedText>
                    {selectedChurch.denomination ? <ThemedText style={styles.selectedMeta}>{selectedChurch.denomination}</ThemedText> : null}
                    {selectedChurch.address ? <ThemedText style={styles.selectedMeta}>{selectedChurch.address}</ThemedText> : null}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <Pressable style={styles.smallPrimary} onPress={onGive}>
                        <ThemedText style={styles.smallPrimaryText}>Give</ThemedText>
                      </Pressable>
                      <Pressable style={styles.smallOutline} onPress={() => router.push(`/church/${selectedChurch.id}`)}>
                        <ThemedText style={styles.smallOutlineText}>View</ThemedText>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.noChurchText}>No church selected</ThemedText>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <Pressable style={styles.smallPrimary} onPress={onChangeChurch}>
                        <ThemedText style={styles.smallPrimaryText}>Find a Church</ThemedText>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Card>

          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryCardContentRow}>
                <Feather name="dollar-sign" size={28} color="#058b00ff" style={styles.summaryCardIcon} />
                <View>
                  <ThemedText style={styles.summaryLabel}>This Month</ThemedText>
                  <ThemedText style={styles.summaryValue}>{loading ? '...' : `$${thisMonth.toLocaleString()}`}</ThemedText>
                </View>
              </View>
            </Card>

            <Card style={[styles.summaryCard, styles.summaryCardRight]}>
              <View style={styles.summaryCardContentRow}>
                <Feather name="calendar" size={28} color="#0172dbff" style={styles.summaryCardIcon} />
                <View>
                  <ThemedText style={styles.summaryLabel}>This Year</ThemedText>
                  <ThemedText style={styles.summaryValue}>{loading ? '...' : `$${thisYear.toLocaleString()}`}</ThemedText>
                </View>
              </View>
            </Card>
          </View>

          <Card title="Quick Tithe" style={styles.quickCard}>
            <View style={styles.quickContent}>
              <View>
                <Feather name="heart" size={28} color="#ff0303ff" />
              </View>
              <View>
                <ThemedText style={styles.usualAmount}>Your usual amount: {loading ? '...' : `$${usualAmount}`}</ThemedText>
              </View>

              <Pressable style={styles.payButton} onPress={onGive}>
                <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
              </Pressable>
            </View>
          </Card>

          <Card title="Recent Activity" style={styles.activityCard}>
            <View>
              {loading && <ActivityIndicator size="small" color="#0369A1" />}
              {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
              {!loading && !error && tithes.length === 0 && <ThemedText>No tithes found.</ThemedText>}
              {!loading && !error && tithes.map((t) => (
                <Transaction key={t.id} title="Tithe" date={new Date(t.created_at).toLocaleDateString()} amount={`$${t.amount}`} />
              ))}
            </View>
          </Card>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 96 },
  header: { marginBottom: 8 },
  welcomeTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  welcomeSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  selectedChurchCard: { marginBottom: 12, paddingVertical: 12, paddingHorizontal: 12 },
  selectedRow: { flexDirection: 'row', alignItems: 'flex-start' },
  selectedLabel: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  selectedName: { fontSize: 18, fontWeight: '700' },
  selectedMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  noChurchText: { fontSize: 14, color: '#374151' },

  smallPrimary: { backgroundColor: '#0369A1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallPrimaryText: { color: '#fff', fontWeight: '700' },
  smallOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E6E9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallOutlineText: { color: '#0369A1', fontWeight: '700' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  summaryCardContentRow: { flexDirection: 'row', alignItems: 'center' },
  summaryCard: { flex: 1, minWidth: 0, marginRight: 8, paddingVertical: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  summaryCardIcon: { marginRight: 4 },
  summaryCardRight: { marginRight: 0, marginLeft: 8 },
  summaryLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: '#0F172A' },

  quickCard: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 12 },
  quickContent: { flexDirection: 'row', alignItems: 'center' },
  usualAmount: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginLeft: 8 },

  payButton: {
    backgroundColor: '#0369A1',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 'auto',
    alignItems: 'center',
  },
  payButtonText: { color: '#fff', fontWeight: '600' },

  activityCard: { marginTop: 12 },
});
