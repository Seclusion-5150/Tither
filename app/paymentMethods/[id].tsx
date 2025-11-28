// app/paymentMethod/[id].tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/services/supabase';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  Alert, 
  ActivityIndicator, 
  Switch,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentMethodScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { createPaymentMethod } = useStripe();
  
  const [mode, setMode] = useState<'add' | 'edit' | 'loading'>('loading');
  const [card, setCard] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    checkMode();
  }, [id]);

  const checkMode = async () => {
    try {
      // Try to fetch as a card first
      const { data: cardData, error: cardError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', id)
        .single();

      if (cardData && !cardError) {
        // It's a card ID - edit mode
        setMode('edit');
        setCard(cardData);
        setUserId(cardData.user_id);
      } else {
        // It's a user ID - add mode
        setMode('add');
        setUserId(id as string);
        setSetAsDefault(true); // Default to true for first card
      }
    } catch (error) {
      console.error('Error checking mode:', error);
      Alert.alert('Error', 'Failed to load payment method');
    }
  };

  const handleAddCard = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setLoading(true);

    try {
      // 1. Create payment method with Stripe
      const { error, paymentMethod } = await createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }

      console.log('Payment Method ID:', paymentMethod.id);

      // 2. Get user's Stripe customer ID or create one
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('stripe_customer_id, first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      let stripeCustomerId = userData.stripe_customer_id;

      // 3. If no Stripe customer, create one via backend
      if (!stripeCustomerId) {
        const response = await fetch('YOUR_BACKEND_URL/create-stripe-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            name: `${userData.first_name} ${userData.last_name}`,
            userId: userId
          })
        });

        const customerData = await response.json();
        stripeCustomerId = customerData.customerId;

        // Update user with Stripe customer ID
        await supabase
          .from('user')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', userId);
      }

      // 4. Attach payment method to customer via backend
      const attachResponse = await fetch('YOUR_BACKEND_URL/save-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          paymentMethodId: paymentMethod.id,
          setAsDefault: setAsDefault
        })
      });

      const attachData = await attachResponse.json();

      if (!attachData.success) {
        throw new Error('Failed to save payment method');
      }

      Alert.alert('Success', 'Card added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (err: any) {
      console.error('Error:', err);
      Alert.alert('Error', err.message || 'An error occurred while saving the card');
    }

    setLoading(false);
  };

  const handleSetDefault = async () => {
    if (!card) return;

    try {
      setLoading(true);

      // Unset all defaults for this user
      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Set this card as default
      const { error: setError } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', card.id);

      if (setError) throw setError;

      // Update in Stripe via backend
      const response = await fetch('YOUR_BACKEND_URL/set-default-payment-method', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: card.stripe_customer_id,
          paymentMethodId: card.stripe_payment_method_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update in Stripe');
      }

      Alert.alert('Success', 'Default card updated', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error: any) {
      console.error('Error setting default:', error);
      Alert.alert('Error', 'Failed to update default card');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!card) return;

    Alert.alert(
      'Delete Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Call backend to detach from Stripe
              const response = await fetch('YOUR_BACKEND_URL/delete-payment-method', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  stripePaymentMethodId: card.stripe_payment_method_id
                })
              });

              if (!response.ok) {
                throw new Error('Failed to remove from Stripe');
              }

              // Delete from Supabase
              const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', card.id);

              if (error) throw error;

              Alert.alert('Success', 'Card removed successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);

            } catch (error: any) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', 'Failed to remove card');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getCardBrandDisplay = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (mode === 'loading') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0369A1" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {mode === 'add' ? (
            // ADD CARD MODE
            <>
              <ThemedText style={styles.title}>Add Payment Method</ThemedText>
              
              <View style={styles.section}>
                <ThemedText style={styles.label}>Card Information</ThemedText>
                <CardField
                  postalCodeEnabled={true}
                  placeholders={{
                    number: '4242 4242 4242 4242',
                  }}
                  cardStyle={{
                    backgroundColor: '#FFFFFF',
                    textColor: '#000000',
                    borderWidth: 1,
                    borderColor: '#E6E6E9',
                    borderRadius: 8,
                  }}
                  style={styles.cardField}
                  onCardChange={(cardDetails) => {
                    setCardComplete(cardDetails.complete);
                  }}
                />
              </View>

              <View style={styles.section}>
                <View style={styles.defaultToggle}>
                  <ThemedText style={styles.label}>Set as default payment method</ThemedText>
                  <Switch
                    value={setAsDefault}
                    onValueChange={setSetAsDefault}
                  />
                </View>
              </View>

              <Pressable
                style={[styles.primaryButton, (!cardComplete || loading) && styles.buttonDisabled]}
                onPress={handleAddCard}
                disabled={!cardComplete || loading}
              >
                <ThemedText style={styles.primaryButtonText}>
                  {loading ? 'Saving...' : 'Save Card'}
                </ThemedText>
              </Pressable>

              <ThemedText style={styles.hint}>
                Your card information is securely stored by Stripe.
              </ThemedText>
            </>
          ) : (
            // EDIT CARD MODE
            <>
              <ThemedText style={styles.title}>Payment Method</ThemedText>

              <View style={styles.cardDisplay}>
                <View style={styles.cardIcon}>
                  <ThemedText style={{ fontSize: 40 }}>💳</ThemedText>
                </View>
                <View style={styles.cardInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText style={styles.cardBrand}>
                      {getCardBrandDisplay(card.card_brand)} •••• {card.card_last4}
                    </ThemedText>
                    {card.is_default && (
                      <View style={styles.defaultBadge}>
                        <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={styles.cardExpiry}>
                    Expires {String(card.card_exp_month).padStart(2, '0')}/{String(card.card_exp_year).slice(-2)}
                  </ThemedText>
                </View>
              </View>

              {!card.is_default && (
                <Pressable
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleSetDefault}
                  disabled={loading}
                >
                  <ThemedText style={styles.primaryButtonText}>
                    {loading ? 'Updating...' : 'Set as Default'}
                  </ThemedText>
                </Pressable>
              )}

              <Pressable
                style={[styles.deleteButton, loading && styles.buttonDisabled]}
                onPress={handleDeleteCard}
                disabled={loading}
              >
                <ThemedText style={styles.deleteButtonText}>
                  Remove Card
                </ThemedText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginTop: 8,
  },
  defaultToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#0369A1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  hint: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 12,
  },
  cardDisplay: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E6E6E9',
  },
  cardIcon: {
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ffebeb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '700',
  },
});
