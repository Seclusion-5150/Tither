import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/card';
import { supabase } from '@/services/supabase';
import { useFocusEffect } from '@react-navigation/native';

type Donor = {
  user_id: string;
  name: string;
  totalAmount: number;
  transactionCount: number;
  lastDonation: string;
};

export default function Members() {
  const [loading, setLoading] = useState(true);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      const loadDonors = async () => {
        try {
          setLoading(true);

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const churchId = user.id;

          // Fetch all donations
          const { data: tithes } = await supabase
            .from('tithes')
            .select('*')
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

          if (tithes && mounted) {
            // Group by donor
            const donorMap = new Map<string, Omit<Donor, 'name'>>();
            
            tithes.forEach((tithe) => {
              const existing = donorMap.get(tithe.user_id);
              if (existing) {
                existing.totalAmount += parseFloat(tithe.amount.toString());
                existing.transactionCount += 1;
                if (new Date(tithe.created_at) > new Date(existing.lastDonation)) {
                  existing.lastDonation = tithe.created_at;
                }
              } else {
                donorMap.set(tithe.user_id, {
                  user_id: tithe.user_id,
                  totalAmount: parseFloat(tithe.amount.toString()),
                  transactionCount: 1,
                  lastDonation: tithe.created_at,
                });
              }
            });

            // Fetch user details from user table
            const userIds = Array.from(donorMap.keys());
            
            const { data: userProfiles } = await supabase
              .from('user')
              .select('id, first_name, last_name')
              .in('id', userIds);

            // Create a map of user names
            const userNamesMap = new Map<string, string>();
            
            userProfiles?.forEach((profile) => {
              const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
              userNamesMap.set(profile.id, name || 'Anonymous');
            });

            // Combine donor data with user names
            const donorList: Donor[] = Array.from(donorMap.entries())
              .map(([userId, donorData]) => {
                return {
                  ...donorData,
                  name: userNamesMap.get(userId) || 'Anonymous',
                };
              })
              .sort((a, b) => b.totalAmount - a.totalAmount);

            setDonors(donorList);
          }
        } catch (error) {
          console.error('Error loading donors:', error);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      loadDonors();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const filteredDonors = donors.filter((donor) =>
    donor.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <ThemedText type="title" style={styles.title}>Members</ThemedText>
            <ThemedText style={styles.subtitle}>View your donors and members</ThemedText>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />

          <Card title={`Total Donors: ${donors.length}`} style={styles.card}>
            {filteredDonors.length === 0 ? (
              <ThemedText style={styles.emptyText}>No donors found</ThemedText>
            ) : (
              filteredDonors.map((donor) => (
                <View key={donor.user_id} style={styles.donorRow}>
                  <View style={styles.donorInfo}>
                    <ThemedText style={styles.donorName}>
                      {donor.name}
                    </ThemedText>
                    <ThemedText style={styles.donorMeta}>
                      {donor.transactionCount} donation{donor.transactionCount !== 1 ? 's' : ''} • 
                      Last: {new Date(donor.lastDonation).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.donorAmount}>
                    ${donor.totalAmount.toFixed(2)}
                  </ThemedText>
                </View>
              ))
            )}
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
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6E6E9',
    fontSize: 16,
    marginBottom: 16,
  },
  card: { marginBottom: 16 },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 24,
  },
  donorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E9',
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  donorMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  donorAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
});
