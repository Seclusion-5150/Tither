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
  ein?: string;
  denomination?: string;
  validated?: boolean;
  datetime_created?: string;
  datetime_updated?: string;
  username?: string;
  phone?: string;
  stripe_account_id?: string;
};

export default function Find() {
  const [query, setQuery] = useState('');
  const [denomination, setDenomination] = useState<'All' | string>('All');
  const [sortByName, setSortByName] = useState(true);
  const [loadingPref, setLoadingPref] = useState(false);
  const [loading, setLoading] = useState(true);
  const [churches, setChurches] = useState<Church[]>([]);

  useEffect(() => {
    fetchChurches();
  }, []);

  const fetchChurches = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('church')
        .select('*');
      
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setChurches(data as Church[]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load churches');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!churches || churches.length === 0) return [];
    
    let list = churches.filter((c) => {
      if (!c || !c.name) return false;
      
      // Filter by search query
      const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
      
      // Filter by denomination
      const matchesDenomination = denomination === 'All' || 
        (c.denomination && c.denomination.toLowerCase() === denomination.toLowerCase());
      
      return matchesQuery && matchesDenomination;
    });
    
    if (sortByName) {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return list;
  }, [churches, query, denomination, sortByName]);

  const saveSelectedChurchPreference = async (churchId: string) => {
    setLoadingPref(true);
   try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    const user = authData?.user;
    if (authErr || !user) throw new Error('Not signed in');

    const { error } = await supabase
      .from('user')
      .update({ selected_church_id: churchId })
      .eq('id', user.id);
    
    if (error) throw error;
    
    	return true;   
   } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save selection');
      return false;
    } finally {
      setLoadingPref(false);
    }
  };

  const onGiveNow = async (church: Church) => {
    const ok = await saveSelectedChurchPreference(church.id);
    if (!ok) return;
    router.push({ pathname: '/(tabs)/give', params: { churchId: church.id } } as any);
  };

  const cycleDenomination = () => {
    if (denomination === 'All') setDenomination('Baptist');
    else if (denomination === 'Baptist') setDenomination('Non-Denominational');
    else if (denomination === 'Non-Denominational') setDenomination('Catholic');
    else if (denomination === 'Catholic') setDenomination('Methodist');
    else if (denomination === 'Methodist') setDenomination('Presbyterian');
    else if (denomination === 'Presbyterian') setDenomination('Lutheran');
    else setDenomination('All');
  };

  const renderItem = ({ item }: { item: Church }) => (
    <Card style={styles.churchCard}>
      <View style={styles.churchRow}>
        <View style={styles.churchInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.churchName}>{item.name}</ThemedText>
            {item.validated && <Feather name="check-circle" size={14} color="#10b981" />}
          </View>
          
          {item.denomination && <ThemedText style={styles.churchMeta}>{item.denomination}</ThemedText>}
          {item.ein && <ThemedText style={styles.churchMeta}>EIN: {item.ein}</ThemedText>}
          {item.phone && <ThemedText style={styles.churchMeta}>Phone: {item.phone}</ThemedText>}
          {item.username && <ThemedText style={styles.churchMeta}>Contact: {item.username}</ThemedText>}
        </View>

        <View style={styles.actions}>
          <Pressable 
            style={[styles.giveBtn, loadingPref && styles.giveBtnDisabled]} 
            onPress={() => onGiveNow(item)} 
            disabled={loadingPref}
          >
            {loadingPref ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.giveText}>Give Now</ThemedText>
            )}
          </Pressable>

          <Pressable style={styles.detailsBtn} onPress={() => router.push(`/church/${item.id}`)}>
            <ThemedText style={styles.detailsText}>View Details</ThemedText>
          </Pressable>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <ThemedView style={styles.safe}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0369A1" />
          <ThemedText style={{ marginTop: 12 }}>Loading churches...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Find Churches</ThemedText>
            <ThemedText style={styles.subtitle}>Discover churches</ThemedText>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color="#6B7280" style={{ marginRight: 8 }} />
              <TextInput 
                value={query} 
                onChangeText={setQuery} 
                placeholder="Search churches by name..." 
                placeholderTextColor="#9CA3AF" 
                style={styles.searchInput} 
                returnKeyType="search" 
              />
            </View>

            <Pressable onPress={cycleDenomination} style={styles.filterBtn}>
              <Feather name="sliders" size={18} color="#0369A1" />
              <ThemedText style={styles.filterText}>{denomination}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.resultHeader}>
            <ThemedText style={styles.resultCount}>
              {filtered.length} {filtered.length === 1 ? 'church' : 'churches'} found
            </ThemedText>
            <Pressable style={styles.sortBtn} onPress={() => setSortByName((v) => !v)}>
              <Feather name="align-left" size={14} color="#0369A1" />
              <ThemedText style={styles.sortText}>
                {sortByName ? 'Sorted A-Z' : 'Unsorted'}
              </ThemedText>
            </Pressable>
          </View>

          <FlatList 
            data={filtered} 
            keyExtractor={(i) => i.id} 
            renderItem={renderItem} 
            contentContainerStyle={{ paddingBottom: 96 }} 
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Feather name="search" size={48} color="#D1D5DB" />
                <ThemedText style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>
                  No churches found
                </ThemedText>
              </View>
            }
          />
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
  searchBox: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    borderWidth: 1, 
    borderColor: '#E6E6E9', 
    height: 44 
  },
  searchInput: { flex: 1, fontSize: 16, color: '#0F172A' },
  filterBtn: { 
    marginLeft: 8, 
    paddingHorizontal: 12, 
    height: 44, 
    borderRadius: 10, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#E6E6E9', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  filterText: { marginLeft: 6, color: '#0369A1', fontWeight: '600' },

  resultHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 12,
    marginBottom: 4
  },
  resultCount: { fontSize: 14, color: '#6B7280' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortText: { color: '#0369A1', marginLeft: 6, fontSize: 13 },

  churchCard: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 12 },
  churchRow: { flexDirection: 'row', alignItems: 'flex-start' },
  churchInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  churchName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  churchMeta: { fontSize: 13, color: '#6B7280', marginBottom: 2 },

  actions: { marginLeft: 12, justifyContent: 'space-between' },
  giveBtn: { 
    backgroundColor: '#0369A1', 
    paddingHorizontal: 12, 
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, 
    borderRadius: 8, 
    marginBottom: 8, 
    alignItems: 'center', 
    minWidth: 84 
  },
  giveBtnDisabled: {
    opacity: 0.6,
  },
  giveText: { color: '#fff', fontWeight: '700' },
  detailsBtn: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 12, 
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E6E6E9', 
    alignItems: 'center', 
    minWidth: 84 
  },
  detailsText: { color: '#0369A1', fontWeight: '700' },
});
