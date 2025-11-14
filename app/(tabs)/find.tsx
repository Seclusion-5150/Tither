import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, FlatList, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/services/supabase';

type Church = {
  id: string;
  name: string;
  denomination?: string;
  address?: string;
  distanceMiles?: number;
  members?: string;
  verified?: boolean;
};

const MOCK_CHURCHES: Church[] = [
  { id: '1', name: 'Grace Community Church', denomination: 'Non-Denominational', address: '123 Main Street, Springfield', distanceMiles: 0.5, members: '500+ members', verified: true },
  { id: '2', name: 'First Baptist Church', denomination: 'Baptist', address: '456 Oak Avenue, Springfield', distanceMiles: 1.2, members: '1000+ members', verified: true },
  { id: '3', name: 'New Life Fellowship', denomination: 'Christian', address: '789 Elm Road, Springfield', distanceMiles: 2.1, members: '300+ members', verified: true },
];

export default function Find() {
  const [query, setQuery] = useState('');
  const [denomination, setDenomination] = useState<'All' | string>('All');
  const [sortByDistance, setSortByDistance] = useState(true);
  const [loadingPref, setLoadingPref] = useState(false);

  const [churches, setChurches] = useState<Church[]>(MOCK_CHURCHES);

  useEffect(() => {
    // fetch real church list from Supabase
    // (async () => {
    //   const { data } = await supabase.from('church').select('id,name,denomination,address,latitude,longitude,members,verified');
    //   if (data) setChurches(data as Church[]);
    // })();
  }, []);

  const filtered = useMemo(() => {
    let list = churches.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    if (denomination !== 'All') list = list.filter((c) => (c.denomination || '').toLowerCase() === denomination.toLowerCase());
    if (sortByDistance) list = [...list].sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));
    return list;
  }, [churches, query, denomination, sortByDistance]);

  const saveSelectedChurchPreference = async (churchId: string) => {
    setLoadingPref(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authErr || !user) throw new Error('Not signed in');

      const payload = { user_id: user.id, key: 'selected_church_id', value: churchId };
      const { error } = await supabase.from('user_preferences').upsert(payload, { onConflict: ['user_id', 'key'] });
      if (error) throw error;
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save selection');
      setLoadingPref(false);
      return false;
    } finally {
      setLoadingPref(false);
    }
    return true;
  };

  const onGiveNow = async (church: Church) => {
    const ok = await saveSelectedChurchPreference(church.id);
    if (!ok) return;
    // navigate to Give tab and pass churchId param for immediate display
    router.push({ pathname: '/(tabs)/give', params: { churchId: church.id } as any } as any);
  };

  const renderItem = ({ item }: { item: Church }) => (
    <Card style={styles.churchCard}>
      <View style={styles.churchRow}>
        <View style={styles.churchInfo}>
          <ThemedText style={styles.churchName}>{item.name} {item.verified ? <Feather name="check-circle" size={14} color="#10b981" /> : null}</ThemedText>
          {item.denomination ? <ThemedText style={styles.churchMeta}>{item.denomination}</ThemedText> : null}
          {item.address ? <ThemedText style={styles.churchMeta}>{item.address}</ThemedText> : null}
          <View style={styles.metaRow}>
            {typeof item.distanceMiles === 'number' && <ThemedText style={styles.distance}>{item.distanceMiles} miles away</ThemedText>}
            {item.members ? <ThemedText style={styles.members}>{item.members}</ThemedText> : null}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.giveBtn} onPress={() => onGiveNow(item)}>
            {loadingPref ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={styles.giveText}>Give Now</ThemedText>}
          </Pressable>

          <Pressable style={styles.detailsBtn} onPress={() => router.push(`/church/${item.id}`)}>
            <ThemedText style={styles.detailsText}>View Details</ThemedText>
          </Pressable>
        </View>
      </View>
    </Card>
  );

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Find Churches</ThemedText>
            <ThemedText style={styles.subtitle}>Discover churches in your area</ThemedText>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color="#6B7280" style={{ marginRight: 8 }} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search churches by name..." placeholderTextColor="#9CA3AF" style={styles.searchInput} returnKeyType="search" />
            </View>

            <Pressable onPress={() => setDenomination((p) => (p === 'All' ? 'Baptist' : p === 'Baptist' ? 'Non-Denominational' : 'All'))} style={styles.filterBtn}>
              <Feather name="sliders" size={18} color="#0369A1" />
              <ThemedText style={styles.filterText}>{denomination}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.resultHeader}>
            <ThemedText style={styles.resultCount}>{filtered.length} churches found nearby</ThemedText>
            <Pressable style={styles.sortBtn} onPress={() => setSortByDistance((v) => !v)}>
              <Feather name="map-pin" size={14} color="#0369A1" />
              <ThemedText style={styles.sortText}>{sortByDistance ? 'Sort by distance' : 'Unsorted'}</ThemedText>
            </Pressable>
          </View>

          <FlatList data={filtered} keyExtractor={(i) => i.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 96 },
  header: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E6E6E9', height: 44 },
  searchInput: { flex: 1, fontSize: 16, color: '#0F172A' },
  filterBtn: { marginLeft: 8, paddingHorizontal: 12, height: 44, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E6E9', flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterText: { marginLeft: 6, color: '#0369A1', fontWeight: '600' },

  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  resultCount: { fontSize: 14, color: '#6B7280' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortText: { color: '#0369A1', marginLeft: 6 },

  churchCard: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 12 },
  churchRow: { flexDirection: 'row', alignItems: 'flex-start' },
  churchInfo: { flex: 1 },
  churchName: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#0F172A' },
  churchMeta: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  distance: { fontSize: 13, color: '#6B7280' },
  members: { fontSize: 13, color: '#6B7280' },

  actions: { marginLeft: 12, justifyContent: 'space-between' },
  giveBtn: { backgroundColor: '#0369A1', paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 8, borderRadius: 8, marginBottom: 8, alignItems: 'center', minWidth: 84 },
  giveText: { color: '#fff', fontWeight: '700' },
  detailsBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 8, borderRadius: 8, borderWidth: 1, borderColor: '#E6E6E9', alignItems: 'center', minWidth: 84 },
  detailsText: { color: '#0369A1', fontWeight: '700' },
});