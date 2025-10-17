import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Dimensions, Pressable, ActivityIndicator } from 'react-native';
import { router, Link } from 'expo-router';
import { Image } from 'expo-image';
// import ParallaxScrollView from '../../components/parallax-scroll-view'; // Not used in this file
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import Card from '../../components/card';
import Transaction from '../../components/transaction';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

type Tithe = {
  id: number;
  user_id: string;
  church_id: string;
  amount: number;
  is_success: boolean;
  datetime_created: string;
  datetime_updated?: string;
};

export default function Dashboard() {
  const [tithes, setTithes] = useState<Tithe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Summary values
  const [thisMonth, setThisMonth] = useState(0);
  const [thisYear, setThisYear] = useState(0);
  const [usualAmount, setUsualAmount] = useState(0);

  useEffect(() => {
    const fetchTithes = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError('Could not get user');
          setLoading(false);
          return;
        }
        const userId = user.id;

        const { data, error: tithesError } = await supabase
          .from('tithes')
          .select('*')
          .eq('user_id', userId)
          .order('datetime_created', { ascending: false });

        if (tithesError) {
          setError('Could not fetch tithes');
          setLoading(false);
          return;
        }

        setTithes(data || []);

        // Calculate summary values
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        let monthTotal = 0;
        let yearTotal = 0;
        let lastAmount = 0;

        (data || []).forEach((tithe: Tithe) => {
          const date = new Date(tithe.datetime_created);
          if (date.getFullYear() === year) {
            yearTotal += tithe.amount;
            if (date.getMonth() === month) {
              monthTotal += tithe.amount;
            }
          }
        });

        if (data && data.length > 0) {
          lastAmount = data[0].amount;
        }

        setThisMonth(monthTotal);
        setThisYear(yearTotal);
        setUsualAmount(lastAmount);

      } catch (e) {
        setError('An unexpected error occurred');
      }
      setLoading(false);
    };

    fetchTithes();
  }, []);

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.welcomeTitle}>Welcome to Tither</ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>Continue your faithful giving</ThemedText>
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

          <Card title="Quick Tithe" style={styles.quickCard}>
            <View style={styles.quickContent}>
              <View>
                <Feather name="heart" size={28} color="#ff0303ff" />
              </View>
              <View>
                <ThemedText style={styles.usualAmount}>
                  Your usual amount: {loading ? '...' : `$${usualAmount}`}
                </ThemedText>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.payButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  router.push('/(tabs)/give');
                }}
                accessibilityRole="button"
                accessibilityLabel="Pay now"
              >
                <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
              </Pressable>
            </View>
          </Card>

          <Card title="Recent Activity" style={styles.activityCard}>
            <View>
              {loading && <ActivityIndicator size="small" color="#0369A1" />}
              {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
              {!loading && !error && tithes.length === 0 && (
                <ThemedText>No tithes found.</ThemedText>
              )}
              {!loading && !error && tithes.map((t) => (
                <Transaction
                  key={t.id}
                  title="Tithe"
                  date={new Date(t.datetime_created).toLocaleDateString()}
                  amount={`$${t.amount}`}
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
  header: { marginBottom: 10 },
  welcomeTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  welcomeSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },

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
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  payButtonText: { color: '#fff', fontWeight: '600' },

  activityCard: { marginTop: 12 },
});