import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/card';
import Transaction from '@/components/transaction';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
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
};

type HistoryItem = Tithe & {
  churchName?: string;
};

const TYPES = ['All', 'Tithe', 'Offering', 'Mission', 'Fundraiser'] as const;
const PERIODS = ['This Month', 'This Quarter', 'This Year', 'All Time'] as const;

function periodRange(period: typeof PERIODS[number]) {
  const now = new Date();
  if (period === 'This Month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  if (period === 'This Quarter') {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
    return { start, end };
  }
  if (period === 'This Year') {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start, end };
  }
  return null;
}

export default function History() {
  const [filterType, setFilterType] = useState<typeof TYPES[number]>('All');
  const [period, setPeriod] = useState<typeof PERIODS[number]>('All Time');
  const [tithes, setTithes] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalThisYear, setTotalThisYear] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      const loadTithes = async () => {
        try {
          setLoading(true);

          // Get current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            Alert.alert('Error', 'Please log in to view history');
            return;
          }

          // Fetch tithes
          const { data: tithesData, error: tithesError } = await supabase
            .from('tithes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (tithesError) throw tithesError;

          // Fetch church names for all unique church IDs
          const churchIds = [...new Set(tithesData?.map(t => t.church_id).filter(Boolean))];
          const churchMap: Record<string, string> = {};

          if (churchIds.length > 0) {
            const { data: churchesData } = await supabase
              .from('church')
              .select('id, name')
              .in('id', churchIds);

            churchesData?.forEach((church: Church) => {
              if (church.id && church.name) {
                churchMap[church.id] = church.name;
              }
            });
          }

          // Combine data
          const historyItems: HistoryItem[] = (tithesData || []).map(tithe => ({
            ...tithe,
            churchName: tithe.church_id ? churchMap[tithe.church_id] : undefined,
          }));

          if (mounted) {
            setTithes(historyItems);

            // Calculate total for this year
            const now = new Date();
            const yearTotal = historyItems
              .filter(t => new Date(t.created_at).getFullYear() === now.getFullYear())
              .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

            setTotalThisYear(yearTotal);
          }
        } catch (error: any) {
          console.error('Error loading history:', error);
          Alert.alert('Error', 'Failed to load payment history');
        } finally {
          if (mounted) setLoading(false);
        }
      };

      loadTithes();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const filtered = useMemo(() => {
    let list = tithes.slice();

    if (filterType !== 'All') {
      const needle = filterType.toLowerCase();
      list = list.filter((h) => (h.notes || '').toLowerCase().includes(needle));
    }

    const range = periodRange(period);
    if (range) {
      const { start, end } = range;
      list = list.filter((h) => {
        const parsed = new Date(h.created_at);
        const t = parsed.getTime();
        return t >= start.getTime() && t <= end.getTime();
      });
    }

    return list;
  }, [tithes, filterType, period]);

  const onDownload = () => {
    Alert.alert('Download', 'Payment history CSV will be prepared for download.');
  };

  if (loading) {
    return (
      <ThemedView style={styles.safe}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0369A1" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>Payment History</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Track your faithful giving</ThemedText>
          </View>

          <Card title="Summary" style={styles.card}>
            <View style={styles.row}>
              <View>
                <ThemedText style={styles.summaryLabel}>Total This Year</ThemedText>
                <ThemedText style={styles.summaryValue}>${totalThisYear.toFixed(2)}</ThemedText>
                <ThemedText style={styles.taxLabel}>Tax Year {new Date().getFullYear()}</ThemedText>
              </View>

              <Pressable
                onPress={onDownload}
                style={({ pressed }) => [styles.downloadButton, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Download payment history"
              >
                <Feather name="download" size={18} color="#0369A1" />
                <ThemedText style={styles.downloadText}>Download</ThemedText>
              </Pressable>
            </View>
          </Card>

          <Card title="Filters" style={styles.card}>
            <View style={styles.filterGroup}>
              <ThemedText style={styles.filterLabel}>Type</ThemedText>
              <View style={styles.chipsRow}>
                {TYPES.map((t) => {
                  const active = t === filterType;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setFilterType(t)}
                      style={[styles.chip, active && styles.chipActive]}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter by ${t}`}
                    >
                      <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{t}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={styles.filterLabel}>Time period</ThemedText>
              <View style={styles.chipsRow}>
                {PERIODS.map((p) => {
                  const active = p === period;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setPeriod(p)}
                      style={[styles.chip, active && styles.chipActive]}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${p}`}
                    >
                      <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{p}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Card>

          <Card title="Transactions" style={styles.card}>
            <View>
              {filtered.length === 0 && (
                <ThemedText style={{ marginBottom: 8 }}>
                  No transactions found for the selected filters.
                </ThemedText>
              )}
              {filtered.map((item) => (
                <View key={item.id} style={styles.txWrap}>
                  <Transaction
                    title={`Tithe${item.churchName ? ` • ${item.churchName}` : ''}`}
                    date={new Date(item.created_at).toLocaleDateString()}
                    amount={`$${parseFloat(item.amount.toString()).toFixed(2)}`}
                  />
                  {item.notes ? <ThemedText style={styles.txNote}>{item.notes}</ThemedText> : null}
                  <ThemedText style={styles.txStatus}>
                    Status: {item.status || 'Completed'}
                  </ThemedText>
                </View>
              ))}
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

  header: { marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  card: { paddingVertical: 12, paddingHorizontal: 12, marginBottom: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 20, fontWeight: '700', marginTop: 6, color: '#000000ff' },
  taxLabel: { fontSize: 12, color: '#6B7280', marginTop: 6 },

  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E9',
    backgroundColor: '#fff',
  },
  downloadText: { color: '#0369A1', marginLeft: 8, fontWeight: '600' },

  filterGroup: { marginBottom: 12 },
  filterLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  chip: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E6E6E9',
  },
  chipActive: { backgroundColor: '#0369A1', borderColor: '#0369A1' },
  chipText: { color: '#0F172A', fontSize: 14 },
  chipTextActive: { color: '#fff' },

  txWrap: { marginBottom: 12 },
  txNote: { marginTop: 4, fontSize: 13, color: '#6B7280', fontStyle: 'italic' },
  txStatus: { marginTop: 2, fontSize: 12, color: '#9CA3AF' },
});
