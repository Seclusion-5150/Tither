import { supabase } from '@/services/supabase';
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Dimensions, Pressable } from 'react-native';
import { router, Link } from 'expo-router';
import { Image } from 'expo-image';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/card';
import Transaction from '@/components/transaction';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

type Transaction = {
  id: string;
  title: string;
  date: string;
  amount: string;
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Monthly Tithe', date: 'Dec 15, 2024', amount: '$120' },
  { id: '2', title: 'Special Offering', date: 'Dec 8, 2024', amount: '$120' },
  { id: '3', title: 'Monthly Tithe', date: 'Nov 15, 2024', amount: '$120' },
];

export default function Dashboard() {
  const thisMonth = '$240';
  const thisYear = '$2,880';
  const usualAmount = '$20';

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
                  <ThemedText style={styles.summaryValue}>{thisMonth}</ThemedText>
                </View>
              </View>
            </Card>

            <Card style={[styles.summaryCard, styles.summaryCardRight]}>
              <View style={styles.summaryCardContentRow}>
                <Feather name="calendar" size={28} color="#0172dbff" style={styles.summaryCardIcon} />
                <View>
                  <ThemedText style={styles.summaryLabel}>This Year</ThemedText>
                  <ThemedText style={styles.summaryValue}>{thisYear}</ThemedText>
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
                  <ThemedText style={styles.usualAmount}>Your usual amount: {usualAmount}</ThemedText>
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
              {MOCK_TRANSACTIONS.map((t) => (
                <Transaction key={t.id} title={t.title} date={t.date} amount={t.amount} />
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