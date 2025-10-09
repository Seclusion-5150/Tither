import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Keyboard, } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feather } from '@expo/vector-icons';

const PRESETS = [20, 50, 100, 200];
const OFFERING_TYPES = ['Tithe', 'Offering', 'Missions', 'Building Fund'] as const;
type PaymentMethod = 'card' | 'bank' | 'mobile';

export default function Give() {
  const [amount, setAmount] = useState<string>('120');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(120);
  const [offeringType, setOfferingType] = useState<string>(OFFERING_TYPES[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);

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
    if (!n || n <= 0) {
      return; // allow UI-level validation or add an Alert here if desired
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/(tabs)/give/payment',
        params: { amount: n, offeringType, note, paymentMethod } as any,
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

          <Card title="Quick Amounts" style={styles.card}>
            <View style={styles.row}>
              {PRESETS.map((p) => {
                const active = selectedPreset === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => onSelectPreset(p)}
                    style={[styles.preset, active && styles.presetActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${p} dollars`}
                  >
                    <ThemedText style={[styles.presetText, active && styles.presetTextActive]}>${p}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card title="Custom Amount" style={styles.card}>
            <TextInput
              value={amount}
              onChangeText={onChangeAmount}
              keyboardType="decimal-pad"
              placeholder="Enter amount"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              returnKeyType="done"
              accessibilityLabel="Enter custom amount"
            />
            <ThemedText style={styles.hint}>{formattedAmount ?? 'Enter a valid amount to continue'}</ThemedText>
          </Card>

          <Card title="Offering Type" style={styles.card}>
            <View style={styles.wrap}>
              {OFFERING_TYPES.map((t) => {
                const active = t === offeringType;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setOfferingType(t)}
                    style={[styles.chip, active && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select offering type ${t}`}
                  >
                    <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{t}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card title="Note (Optional)" style={styles.card}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a personal note or prayer request..."
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textarea]}
              multiline
              accessibilityLabel="Add a personal note"
            />
          </Card>

          <Card title="Payment Method" style={styles.card}>
            <View style={styles.col}>
              {(['card', 'bank', 'mobile'] as PaymentMethod[]).map((m) => {
                const active = paymentMethod === m;
                const label =
                  m === 'card' ? 'Credit / Debit Card' : m === 'bank' ? 'Bank Transfer' : 'Mobile Payment';
                const subtitle =
                  m === 'card' ? 'Fast and secure' : m === 'bank' ? 'ACH or bank debit' : 'Apple Pay / Google Pay';
                return (
                  <Pressable
                    key={m}
                    onPress={() => setPaymentMethod(m)}
                    style={[styles.option, active && styles.optionActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`Pay with ${label}`}
                  >
                    <View>
                      <ThemedText style={styles.optionTitle}>{label}</ThemedText>
                      <ThemedText style={styles.optionSubtitle}>{subtitle}</ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Pressable
            onPress={continueToPayment}
            style={({ pressed }) => [styles.continue, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Continue to payment"
          >
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

  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
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