import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081';

type PaymentMethod = {
  id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  stripe_payment_method_id: string;
};

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const amount = Number(params.amount);
  const offeringType = params.offeringType as string;
  const note = params.note as string;
  const churchId = params.churchId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      
      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Error', 'Please log in to continue');
        router.back();
        return;
      }
      
      setUserId(user.id);

      // Get payment methods
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPaymentMethods(data || []);
      
      // Auto-select default card
      const defaultCard = data?.find((pm) => pm.is_default);
      if (defaultCard) {
        setSelectedPaymentMethod(defaultCard);
      }
    } catch (error: any) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch(`${BASE_URL}/api/payment/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          userId: userId,
          churchId: churchId,
          paymentMethodId: selectedPaymentMethod.stripe_payment_method_id,
          notes: note || `${offeringType} offering`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success! 🎉',
          `Your ${offeringType.toLowerCase()} of $${amount.toFixed(2)} has been processed.`,
          [
            {
              text: 'Done',
              onPress: () => router.push('../'),
            },
          ]
        );
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', error.message || 'An error occurred while processing your payment');
    } finally {
      setProcessing(false);
    }
  };

  const getCardBrandDisplay = (brand: string) => {
    if (!brand) return 'Card';
    return brand.charAt(0).toUpperCase() + brand.slice(1);
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
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#0F172A" />
            </Pressable>
            <ThemedText type="title" style={styles.headerTitle}>Confirm Payment</ThemedText>
          </View>

          <Card style={styles.card}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.label}>Amount</ThemedText>
              <ThemedText style={styles.amountLarge}>${amount.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.label}>Type</ThemedText>
              <ThemedText style={styles.value}>{offeringType}</ThemedText>
            </View>
            {note ? (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.label}>Note</ThemedText>
                <ThemedText style={styles.value}>{note}</ThemedText>
              </View>
            ) : null}
          </Card>

          <Card title="Select Payment Method" style={styles.card}>
            {paymentMethods.length === 0 ? (
              <View>
                <ThemedText style={styles.emptyText}>No payment methods found</ThemedText>
                <Pressable
                  onPress={() => router.push(`/paymentMethods/${userId}`)}
                  style={styles.addButton}
                >
                  <ThemedText style={styles.addButtonText}>Add Payment Method</ThemedText>
                </Pressable>
              </View>
            ) : (
              paymentMethods.map((pm) => {
                const selected = selectedPaymentMethod?.id === pm.id;
                return (
                  <Pressable
                    key={pm.id}
                    onPress={() => setSelectedPaymentMethod(pm)}
                    style={[styles.paymentMethodCard, selected && styles.paymentMethodCardActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ThemedText style={styles.cardBrand}>
                          {getCardBrandDisplay(pm.card_brand)} •••• {pm.card_last4}
                        </ThemedText>
                        {pm.is_default && (
                          <View style={styles.defaultBadge}>
                            <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={styles.cardExpiry}>
                        Expires {String(pm.card_exp_month).padStart(2, '0')}/
                        {String(pm.card_exp_year).slice(-2)}
                      </ThemedText>
                    </View>
                    {selected && <Feather name="check-circle" size={24} color="#0369A1" />}
                  </Pressable>
                );
              })
            )}
          </Card>

          <Pressable
            onPress={handlePayment}
            disabled={!selectedPaymentMethod || processing}
            style={[
              styles.continueButton,
              (!selectedPaymentMethod || processing) && styles.continueButtonDisabled,
            ]}
          >
            <ThemedText style={styles.continueButtonText}>
              {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </ThemedText>
          </Pressable>

          <ThemedText style={styles.secureText}>
            🔒 Your payment is secure and encrypted
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 96 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
  },
  card: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0369A1',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#0369A1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6E6E9',
    marginBottom: 12,
  },
  paymentMethodCardActive: {
    borderColor: '#0369A1',
    backgroundColor: '#F0F9FF',
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#0369A1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secureText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 16,
    fontSize: 13,
  },
});
