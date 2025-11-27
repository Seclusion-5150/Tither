import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Keyboard, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';

const PRESETS = [20, 50, 100, 200];
const OFFERING_TYPES = ['Tithe', 'Offering', 'Missions', 'Fundraiser'] as const;
type PaymentMethod = 'card' | 'bank' | 'mobile';

type Church = {
  id: string;
  name?: string;
  denomination?: string;
  address?: string;
  verified?: boolean;
};

export default function Give() {
  const params = useLocalSearchParams<{ churchId?: string }>();
  const paramChurchId = params?.churchId ?? null;

  const [amount, setAmount] = useState<string>('120');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(120);
  const [offeringType, setOfferingType] = useState<string>(OFFERING_TYPES[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);

  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [churchLoading, setChurchLoading] = useState(true);
  const [churchError, setChurchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchChurchById = async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('church')
          .select('id,name,denomination,address')
          .eq('id', id)
          .single();

        if (error || !data) throw error ?? new Error('Church not found');
        if (!mounted) return;
        setSelectedChurch(data as Church);
      } catch (e: any) {
        if (!mounted) return;
        setChurchError(e?.message ?? 'Failed to load church');
      } finally {
        if (!mounted) return;
        setChurchLoading(false);
      }
    };

  const loadSelectedChurch = async () => {
    setChurchLoading(true);
    setChurchError(null);
    try {
      // If there's a church ID in the URL params, use that
      if (paramChurchId && paramChurchId.trim()) {
	console.log("TESTINGINGIGNIGNG");
        await fetchChurchById(paramChurchId);
        return;
      }

      // Get the authenticated user
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authErr || !user) {
        setChurchError('Not signed in');
        setChurchLoading(false);
        return;
      }

      // Fetch user profile with both church fields in one query
      const { data: profile, error: profileError } = await supabase
        .from('user')
        .select('selected_church_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setChurchError('Failed to load user profile');
        setChurchLoading(false);
        return;
      }

      // Priority: selected_church_id, fallback to church_id
      const churchId = profile?.selected_church_id || profile?.church_id;
    
      if (churchId) {
        await fetchChurchById(churchId);
      } else {
        setSelectedChurch(null);
        setChurchLoading(false);
      }
    } catch (error: any) {
      setChurchError(error?.message ?? 'Failed to load church');
      setChurchLoading(false);
    }
  };

  loadSelectedChurch();

  return () => {
    mounted = false;
  };
}, [paramChurchId]);
  
  const onSelectPreset = (value: number) => {
    setSelectedPreset(value);
    setAmount(String(value));
    Keyboard.dismiss();
  };

  const onChangeAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
    setSelectedPreset(null);
  };

  const formattedAmount = useMemo(() => {
    const n = Number(amount);
    if (Number.isNaN(n) || n <= 0) return null;
    return `$${n.toFixed(2).replace(/\.00$/, '')}`;
  }, [amount]);

  const continueToPayment = () => {
    const n = Number(amount);
    if (!n || n <= 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/(tabs)/give/payment',
        params: {
          amount: n,
          offeringType,
          note,
          paymentMethod,
          churchId: selectedChurch?.id ?? null,
        } as any,
      } as any);
    }, 300);
  };

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Feather name="heart" size={28} color="#ff3b30" />
            <ThemedText type="title" style={styles.headerTitle}>Pay Your Tithe</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Give cheerfully as the Lord has blessed you</ThemedText>
          </View>

          <Card style={styles.churchCardTop}>
            {churchLoading ? (
              <ActivityIndicator size="small" />
            ) : churchError ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText style={{ color: '#b91c1c' }}>{churchError}</ThemedText>
                <Pressable onPress={() => router.push('/(tabs)/find')} style={styles.smallOutline}>
                  <ThemedText style={styles.smallOutlineText}>Choose</ThemedText>
                </Pressable>
              </View>
            ) : selectedChurch ? (
              <View style={styles.churchRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.churchName}>
                    {selectedChurch.name} {selectedChurch.verified ? <Feather name="check-circle" size={14} color="#10b981" /> : null}
                  </ThemedText>
                  {selectedChurch.denomination ? <ThemedText style={styles.churchMeta}>{selectedChurch.denomination}</ThemedText> : null}
                  {selectedChurch.address ? <ThemedText style={styles.churchMeta}>{selectedChurch.address}</ThemedText> : null}
                </View>
                <View style={{ marginLeft: 12, justifyContent: 'center' }}>
                  <Pressable onPress={() => router.push('/(tabs)/find')} style={styles.smallOutline}>
                    <ThemedText style={styles.smallOutlineText}>Change</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.churchRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.churchName}>No church selected</ThemedText>
                  <ThemedText style={styles.churchMeta}>Choose a church to send this payment to</ThemedText>
                </View>
                <View style={{ marginLeft: 12, justifyContent: 'center' }}>
                  <Pressable onPress={() => router.push('/(tabs)/find')} style={styles.smallPrimary}>
                    <ThemedText style={styles.smallPrimaryText}>Find</ThemedText>
                  </Pressable>
                </View>
              </View>
            )}
          </Card>

          <Card title="Quick Amounts" style={styles.card}>
            <View style={styles.row}>
              {PRESETS.map((p) => {
                const active = selectedPreset === p;
                return (
                  <Pressable key={p} onPress={() => onSelectPreset(p)} style={[styles.preset, active && styles.presetActive]}>
                    <ThemedText style={[styles.presetText, active && styles.presetTextActive]}>${p}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card title="Custom Amount" style={styles.card}>
            <TextInput value={amount} onChangeText={onChangeAmount} keyboardType="decimal-pad" placeholder="Enter amount" placeholderTextColor="#9CA3AF" style={styles.input} returnKeyType="done" />
            <ThemedText style={styles.hint}>{formattedAmount ?? 'Enter a valid amount to continue'}</ThemedText>
          </Card>

          <Card title="Offering Type" style={styles.card}>
            <View style={styles.wrap}>
              {OFFERING_TYPES.map((t) => {
                const active = t === offeringType;
                return (
                  <Pressable key={t} onPress={() => setOfferingType(t)} style={[styles.chip, active && styles.chipActive]}>
                    <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{t}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card title="Note (Optional)" style={styles.card}>
            <TextInput value={note} onChangeText={setNote} placeholder="Add a personal note or prayer request..." placeholderTextColor="#9CA3AF" style={[styles.input, styles.textarea]} multiline />
          </Card>

          <Card title="Payment Method" style={styles.card}>
            <View style={styles.col}>
              {(['card', 'bank', 'mobile'] as PaymentMethod[]).map((m) => {
                const active = paymentMethod === m;
                const label = m === 'card' ? 'Credit / Debit Card' : m === 'bank' ? 'Bank Transfer' : 'Mobile Payment';
                const subtitle = m === 'card' ? 'Fast and secure' : m === 'bank' ? 'ACH or bank debit' : 'Apple Pay / Google Pay';
                return (
                  <Pressable key={m} onPress={() => setPaymentMethod(m)} style={[styles.option, active && styles.optionActive]}>
                    <View>
                      <ThemedText style={styles.optionTitle}>{label}</ThemedText>
                      <ThemedText style={styles.optionSubtitle}>{subtitle}</ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Pressable onPress={continueToPayment} style={({ pressed }) => [styles.continue, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}>
            <ThemedText style={styles.continueText}>{loading ? 'Continuing...' : 'Continue to Payment'}</ThemedText>
          </Pressable>

          <ThemedText style={styles.secure}>Your payment is secure and encrypted</ThemedText>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 96 },

  header: { alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 20, marginTop: 8 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  churchCardTop: { marginTop: 8, marginBottom: 12, paddingVertical: 12, paddingHorizontal: 12 },

  churchRow: { flexDirection: 'row', alignItems: 'center' },
  churchName: { fontSize: 16, fontWeight: '700' },
  churchMeta: { fontSize: 13, color: '#6B7280', marginTop: 4 },

  smallPrimary: { backgroundColor: '#0369A1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallPrimaryText: { color: '#fff', fontWeight: '700' },
  smallOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E6E9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallOutlineText: { color: '#0369A1', fontWeight: '700' },

  card: { marginTop: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  preset: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E9',
  },
  presetActive: { backgroundColor: '#0369A1', borderColor: '#0369A1' },
  presetText: { color: '#0F172A', fontWeight: '600' },
  presetTextActive: { color: '#fff' },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E6E6E9',
    fontSize: 16,
    color: '#0F172A',
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  hint: { marginTop: 8, color: '#6B7280' },

  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E6E9',
    // marginRight: 8,
    // marginBottom: 4,
  },
  chipActive: { backgroundColor: '#0369A1', borderColor: '#0369A1' },
  chipText: { color: '#0F172A', fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  col: { flexDirection: 'column' },
  option: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6E6E9',
    marginBottom: 8,
  },
  optionActive: { borderColor: '#0369A1', backgroundColor: '#ECF8FF' },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  optionSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },

  continue: {
    marginTop: 18,
    backgroundColor: '#0369A1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  secure: { marginTop: 8, textAlign: 'center', color: '#6B7280' },
});
