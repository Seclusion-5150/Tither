import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/card';
import Transaction from '@/components/transaction';
import { Feather } from '@expo/vector-icons';

type HistoryItem = {
  id: string;
  title: string;
  date: string;
  method?: string;
  status?: 'Completed' | 'Pending' | 'Failed';
  amount: string;
  note?: string;
};

const MOCK_HISTORY: HistoryItem[] = [
  { id: '1', title: 'Monthly Tithe', date: 'Dec 15, 2024', method: 'Credit Card', status: 'Completed', amount: '$120', note: 'Faithful giving for December' },
  { id: '2', title: 'Special Offering', date: 'Dec 5, 2024', method: 'Credit Card', status: 'Completed', amount: '$50', note: 'Christmas outreach program' },
  { id: '3', title: 'Monthly Tithe', date: 'Nov 15, 2024', method: 'Credit Card', status: 'Completed', amount: '$120' },
  { id: '4', title: 'Building Fund', date: 'Nov 5, 2024', method: 'Mobile Payment', status: 'Completed', amount: '$200', note: 'New sanctuary construction' },
  { id: '5', title: 'Monthly Tithe', date: 'Oct 15, 2024', method: 'Credit Card', status: 'Completed', amount: '$120' },
  { id: '6', title: 'Missions', date: 'Oct 1, 2024', method: 'Bank Transfer', status: 'Completed', amount: '$75', note: 'Supporting missionaries in Kenya' },
];

const TYPES = ['All', 'Tithe', 'Offering', 'Missions', 'Building Fund'] as const;
const PERIODS = ['This Month', 'This Quarter', 'This Year', 'All Time'] as const;

export default function History() {
  const [filterType, setFilterType] = useState<typeof TYPES[number]>('All');
  const [period, setPeriod] = useState<typeof PERIODS[number]>('All Time');

  const totalThisYear = '$685.00';

  const filtered = useMemo(() => {
    if (filterType === 'All') return MOCK_HISTORY;
    if (filterType === 'Tithe') return MOCK_HISTORY.filter((h) => h.title.includes('Tithe'));
    return MOCK_HISTORY.filter((h) => h.title.includes(filterType));
  }, [filterType]);

  const onDownload = () => {
    Alert.alert('Download', 'Payment history CSV will be prepared for download.');
  };

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
                <ThemedText style={styles.summaryValue}>{totalThisYear}</ThemedText>
                <ThemedText style={styles.taxLabel}>Tax Year 2024</ThemedText>
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
              {filtered.map((item) => (
                <View key={item.id} style={styles.txWrap}>
                  <Transaction title={item.title} date={item.date} amount={item.amount} />
                  {item.note ? <ThemedText style={styles.txNote}>{item.note}</ThemedText> : null}
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E6E9',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: '#0369A1', borderColor: '#0369A1' },
  chipText: { color: '#0F172A', fontSize: 14 },
  chipTextActive: { color: '#fff' },

  txWrap: { marginBottom: 8 },
  txNote: { marginTop: 6, fontSize: 14, color: '#374151' },
});