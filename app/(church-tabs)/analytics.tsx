import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/card';
import { supabase } from '@/services/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgDonation: 0,
    totalTransactions: 0,
    recurringDonors: 0,
    monthlyGrowth: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      const loadAnalytics = async () => {
        try {
          setLoading(true);

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const churchId = user.id;

          // Fetch all donations for this church
          const { data: tithes } = await supabase
            .from('tithes')
            .select('*')
            .eq('church_id', churchId);

          if (tithes && mounted) {
            const total = tithes.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            const avgDonation = tithes.length > 0 ? total / tithes.length : 0;

            // Count donors with multiple donations
            const donorCounts = new Map();
            tithes.forEach((t) => {
              donorCounts.set(t.user_id, (donorCounts.get(t.user_id) || 0) + 1);
            });
            const recurring = Array.from(donorCounts.values()).filter((count) => count > 1).length;

            // Calculate month-over-month growth
            const now = new Date();
            const thisMonth = tithes.filter((t) => {
              const d = new Date(t.created_at);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
            
            const lastMonth = tithes.filter((t) => {
              const d = new Date(t.created_at);
              const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
              return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
            });

            const thisMonthTotal = thisMonth.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            const lastMonthTotal = lastMonth.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            const growth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

            setStats({
              avgDonation,
              totalTransactions: tithes.length,
              recurringDonors: recurring,
              monthlyGrowth: growth,
            });
          }
        } catch (error) {
          console.error('Error loading analytics:', error);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      loadAnalytics();

      return () => {
        mounted = false;
      };
    }, [])
  );

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
            <ThemedText type="title" style={styles.title}>Analytics</ThemedText>
            <ThemedText style={styles.subtitle}>Giving insights and trends</ThemedText>
          </View>

          <Card title="Key Metrics" style={styles.card}>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Feather name="dollar-sign" size={32} color="#10b981" />
                <ThemedText style={styles.metricValue}>${stats.avgDonation.toFixed(2)}</ThemedText>
                <ThemedText style={styles.metricLabel}>Avg Donation</ThemedText>
              </View>

              <View style={styles.metric}>
                <Feather name="activity" size={32} color="#3b82f6" />
                <ThemedText style={styles.metricValue}>{stats.totalTransactions}</ThemedText>
                <ThemedText style={styles.metricLabel}>Total Gifts</ThemedText>
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Feather name="repeat" size={32} color="#8b5cf6" />
                <ThemedText style={styles.metricValue}>{stats.recurringDonors}</ThemedText>
                <ThemedText style={styles.metricLabel}>Recurring Donors</ThemedText>
              </View>

              <View style={styles.metric}>
                <Feather name="trending-up" size={32} color="#f59e0b" />
                <ThemedText style={styles.metricValue}>
                  {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
                </ThemedText>
                <ThemedText style={styles.metricLabel}>Monthly Growth</ThemedText>
              </View>
            </View>
          </Card>

          <Card title="Coming Soon" style={styles.card}>
            <ThemedText style={styles.comingSoon}>
              📊 Advanced analytics and reporting features are coming soon!
            </ThemedText>
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
  header: { marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  card: { marginBottom: 16 },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  comingSoon: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    paddingVertical: 24,
  },
});
