import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/card';
import Transaction from '@/components/transaction';
import { supabase } from '@/services/supabase';
import { useFocusEffect } from '@react-navigation/native';

type Tithe = {
  id: string;
  user_id: string;
  church_id: string;
  amount: number;
  status: string;
  notes?: string;
  created_at: string;
};

export default function ChurchDashboard() {
  const [tithes, setTithes] = useState<Tithe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [churchName, setChurchName] = useState<string>('');

  const [thisMonth, setThisMonth] = useState(0);
  const [thisYear, setThisYear] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data: authData, error: authErr } = await supabase.auth.getUser();
          const user = authData?.user;
          if (authErr || !user) {
            setError('Not authenticated');
            return;
          }

          const churchId = user.id;

          // Get church info
          const { data: churchData } = await supabase
            .from('church')
            .select('name')
            .eq('id', churchId)
            .single();

          if (churchData && mounted) {
            setChurchName(churchData.name || 'Your Church');
          }

          // Fetch tithes for this church
          const { data, error: tithesError } = await supabase
            .from('tithes')
            .select('*')
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

          if (tithesError) {
            setError('Could not fetch donations');
            return;
          }

          const list: Tithe[] = data || [];
          if (mounted) setTithes(list);

          // Compute summary
          const now = new Date();
          const month = now.getMonth();
          const year = now.getFullYear();
          let monthTotal = 0;
          let yearTotal = 0;
          const uniqueDonors = new Set();

          list.forEach((t) => {
            const d = new Date(t.created_at);
            const amount = parseFloat(t.amount.toString());
            
            if (d.getFullYear() === year) {
              yearTotal += amount;
              if (d.getMonth() === month) monthTotal += amount;
            }
            
            uniqueDonors.add(t.user_id);
          });

          if (mounted) {
            setThisMonth(monthTotal);
            setThisYear(yearTotal);
            setTotalDonors(uniqueDonors.size);
          }
        } catch (e) {
          if (mounted) setError('Unexpected error');
        } finally {
          if (mounted) setLoading(false);
        }
      };

      load();
      return () => {
        mounted = false;
      };
    }, [])
  );

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.welcomeTitle}>{churchName}</ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>Church Dashboard</ThemedText>
          </View>

          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryCardContentRow}>
                <Feather name="dollar-sign" size={28} color="#058b00ff" style={styles.summaryCardIcon} />
                <View>
                  <ThemedText style={styles.summaryLabel}>This Month</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {loading ? '...' : `$${thisMonth.toLocaleString()}`}
                  </ThemedText>
                </View>
              </View>
            </Card>

            <Card style={[styles.summaryCard, styles.summaryCardRight]}>
              <View style={styles.summaryCardContentRow}>
                <Feather name="calendar" size={28} color="#0172dbff" style={styles.summaryCardIcon} />
                <View>
                  <ThemedText style={styles.summaryLabel}>This Year</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {loading ? '...' : `$${thisYear.toLocaleString()}`}
                  </ThemedText>
                </View>
              </View>
            </Card>
          </View>

          <Card style={styles.donorsCard}>
            <View style={styles.summaryCardContentRow}>
              <Feather name="users" size={28} color="#7c3aed" style={styles.summaryCardIcon} />
              <View>
                <ThemedText style={styles.summaryLabel}>Total Donors</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {loading ? '...' : totalDonors}
                </ThemedText>
              </View>
            </View>
          </Card>

          <Card title="Recent Donations" style={styles.activityCard}>
            <View>
              {loading && <ActivityIndicator size="small" color="#0369A1" />}
              {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
              {!loading && !error && tithes.length === 0 && (
                <ThemedText>No donations received yet.</ThemedText>
              )}
              {!loading && !error && tithes.slice(0, 10).map((t) => (
                <Transaction
                  key={t.id}
                  title={t.notes || 'Donation'}
                  date={new Date(t.created_at).toLocaleDateString()}
                  amount={`$${parseFloat(t.amount.toString()).toFixed(2)}`}
                />
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

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  summaryCardContentRow: { flexDirection: 'row', alignItems: 'center' },
  summaryCard: { 
    flex: 1, 
    minWidth: 0, 
    marginRight: 8, 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  summaryCardIcon: { marginRight: 4 },
  summaryCardRight: { marginRight: 0, marginLeft: 8 },
  summaryLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: '#0F172A' },

  donorsCard: { 
    marginTop: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 12 
  },

  activityCard: { marginTop: 12 },
});
