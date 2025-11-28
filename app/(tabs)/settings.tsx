import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/services/supabase';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [autoPay, setAutoPay] = useState(true);
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [defaultAmount, setDefaultAmount] = useState('20');
  const [reminders, setReminders] = useState(true);
  const [monthlyStatements, setMonthlyStatements] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [frequency, setFrequency] = useState('Weekly');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const frequencies = ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Annually'];
   
  useEffect(() => {
    loadProfile();
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchCards();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);	
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('No User Logged in!');
      
      setUserId(user.id);

      const { data, error } = await supabase
        .from('user') 
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile({ ...data, email: user.email });
      setDefaultAmount(data.default_tithe_amount?.toString() || '20');
      setFrequency(data.tithe_frequency?.toString() || 'Weekly');
      setAutoPay(data.auto_pay || false);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out');
      return;
    }
    router.replace('/(auth)/login');
  };

  const row = (label: string, right: React.ReactNode) => (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {right}
    </View>
  );

  const handleSaveAmount = async () => {
    const amount = parseFloat(defaultAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('user')
        .update({ default_tithe_amount: amount })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Default amount updated!');
    } catch (error) {
      console.error('Error updating:', error);
      Alert.alert('Error', 'Failed to update amount');
    }
  };
  
  const setTitheFrequency = async (newFrequency: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user')
        .update({ tithe_frequency: newFrequency })
        .eq('id', userId);

      if (error) throw error;
    
      setFrequency(newFrequency);
      setDropdownOpen(false);
      Alert.alert('Success', `Frequency updated to ${newFrequency}`);
    } catch (error) {
      console.error('Error updating frequency:', error);
      Alert.alert('Error', 'Failed to update frequency');
    }
  };

  const getFullName = () => {
    if (!profile) return 'N/A';
    return [profile.first_name, profile.middle_name, profile.last_name]
      .filter(Boolean)
      .join(' ') || 'N/A';
  };
  
  const fetchCards = async () => {

	if(!userId) return;
  	  
	  try {
		setCardsLoading(true);

		const { data, error } = await supabase
					.from('payment_methods')
					.select("*")
					.eq('user_id', userId)
					.order('is_default', { ascending: false }) // Show default card first
					.order('created_at', { ascending: false }); // Then by newest
		if(error) {

			console.log("Error fetching cards: ", error.message);
			Alert.alert("Error", "Failed to load payment methods.");
			return;
		}

		setCards(data || []);
	}
	catch(error) {
		console.log("An unexpected error occurred: ", error.message);
	}
	finally {
		setCardsLoading(false);
	}
  };


  const editPaymentMethod = (cardId : string) => {
  	router.push(`../paymentMethods/${cardId}`);
  };

  const addPaymentMethod = () => {
	router.push(`../paymentMethods/${userId}`);  	
  };

  return (
    <ThemedView style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Settings</ThemedText>
            <ThemedText style={styles.subtitle}>Manage your account & preferences</ThemedText>
          </View>

          <Card title="Profile Information" style={styles.card}>
            {row('Full Name', <ThemedText style={styles.value}>{getFullName()}</ThemedText>)}
            {row('Email Address', <ThemedText style={styles.value}>{profile?.email || 'N/A'}</ThemedText>)}
            {row('Phone Number', <ThemedText style={styles.value}>{profile?.phone || 'N/A'}</ThemedText>)}

            <Pressable style={styles.primaryButton} onPress={() => Alert.alert('Update Profile', 'Profile update flow here')} accessibilityRole="button">
              <ThemedText style={styles.primaryButtonText}>Update Profile</ThemedText>
            </Pressable>
          </Card>

          <Card title="Giving Preferences" style={styles.card}>
            <View style={styles.formRow}>
              <ThemedText style={styles.label}>Default Tithe Amount</ThemedText>
              <TextInput
                value={defaultAmount}
                onChangeText={setDefaultAmount}
                style={styles.inputInline}
                keyboardType="numeric"
                accessibilityLabel="Default amount"
              />
            </View>

            <Pressable 
              style={styles.primaryButton} 
              onPress={handleSaveAmount}
            >
              <ThemedText style={styles.primaryButtonText}>Save Amount</ThemedText>
            </Pressable>

            <View style={styles.formRow}>
              <ThemedText style={styles.label}>Giving Frequency</ThemedText>
              <View style={styles.dropdownWrapper}>
                <Pressable 
                  style={styles.dropdownButton}
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                  <ThemedText style={styles.value}>{frequency}</ThemedText>
                  <Feather 
                    name={dropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color="#6B7280" 
                  />
                </Pressable>

                {dropdownOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      nestedScrollEnabled={true} 
                      style={{ maxHeight: 90 }}  
                      // contentContainerStyle={{ paddingVertical: 0 }}
                    >
                      {frequencies.map((freq) => (
                        <Pressable
                          key={freq}
                          style={styles.dropdownItem}
                          onPress={() => setTitheFrequency(freq)}
                        >
                          <ThemedText style={styles.dropdownItemText}>{freq}</ThemedText>
                          {frequency === freq && (
                            <Feather name="check" size={16} color="#0369A1" />
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.toggleBlock}>
              <ThemedText style={styles.label}>Auto-pay enabled</ThemedText>
              <View style={styles.toggleRow}>
                <ThemedText style={styles.smallText}>Auto charges to preferred method</ThemedText>
                <Switch value={autoPay} onValueChange={setAutoPay} accessibilityLabel="Toggle auto pay" />
              </View>
            </View>
          </Card>

			<Card title="Payment Methods" style={styles.card}>
			  {cardsLoading ? (
				<ActivityIndicator size="small" color="#0369A1" />
			  ) : cards.length > 0 ? (
				<>
				  {cards.map((item: any, index: number) => (
					<View key={item.id}>
					  <View style={styles.cardRow}>
						<View style={{ flex: 1 }}>
						  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
							<ThemedText style={styles.label}>
							  {getCardBrandDisplay(item.card_brand)} ending in {item.card_last4}
							</ThemedText>
							{item.is_default && (
							  <View style={styles.defaultBadge}>
								<ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
							  </View>
							)}
						  </View>
						  <ThemedText style={styles.smallText}>
							Expires {String(item.card_exp_month).padStart(2, '0')}/{String(item.card_exp_year).slice(-2)}
						  </ThemedText>
						</View>

						<Pressable 
						  onPress={() => editPaymentMethod(item.id)} 
						  style={styles.ghostButton} 
						  accessibilityRole="button"
						>
						  <ThemedText style={styles.ghostText}>Edit</ThemedText>
						</Pressable>
					  </View>
					  {index < cards.length - 1 && <View style={styles.separator} />}
					</View>
				  ))}
				</>
			  ) : (
				<ThemedText style={styles.emptyText}>No payment methods saved</ThemedText>
			  )}

			  <Pressable 
				onPress={addPaymentMethod} 
				style={styles.primaryButtonOutline} 
				accessibilityRole="button"
			  >
				<ThemedText style={styles.primaryButtonOutlineText}>Add New Payment Method</ThemedText>
			  </Pressable>
			</Card>

          <Card title="Notifications" style={styles.card}>
            <View style={styles.switchRowSimple}>
              <ThemedText style={styles.label}>Payment Confirmations</ThemedText>
              <Switch value={notifyPayments} onValueChange={setNotifyPayments} accessibilityLabel="Toggle payment confirmations" />
            </View>

            <View style={styles.switchRowSimple}>
              <ThemedText style={styles.label}>Giving Reminders</ThemedText>
              <Switch value={reminders} onValueChange={setReminders} accessibilityLabel="Toggle giving reminders" />
            </View>

            <View style={styles.switchRowSimple}>
              <ThemedText style={styles.label}>Monthly Statements</ThemedText>
              <Switch value={monthlyStatements} onValueChange={setMonthlyStatements} accessibilityLabel="Toggle monthly statements" />
            </View>
          </Card>

          <Card title="Security & Privacy" style={styles.card}>
            <Pressable style={styles.linkRow} onPress={() => Alert.alert('Privacy', 'Show privacy information')} accessibilityRole="button">
              <ThemedText style={styles.label}>See how we protect your data</ThemedText>
              <Feather name="chevron-right" size={18} color="#6B7280" />
            </Pressable>
          </Card>

          <Card title="Help & Support" style={styles.card}>
            <Pressable style={styles.linkRow} onPress={() => Alert.alert('Help', 'Open help center')} accessibilityRole="button">
              <ThemedText style={styles.label}>Help center and contact options</ThemedText>
              <Feather name="chevron-right" size={18} color="#6B7280" />
            </Pressable>
          </Card>

          <Card style={styles.card}>
            <Pressable onPress={handleLogout} style={styles.logoutButton} accessibilityRole="button" accessibilityLabel="Log out">
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </Pressable>
          </Card>

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 96 },

  header: { marginBottom: 10, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  card: { marginBottom: 12 },

  row: { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 16, fontWeight: '600', color: '#111827' },

  primaryButton: { marginTop: 8, backgroundColor: '#0369A1', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },

  primaryButtonOutline: { marginTop: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E6E9', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryButtonOutlineText: { color: '#0369A1', fontWeight: '700' },

  formRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  inputInline: { width: 100, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E6E6E9', textAlign: 'center' },

  select: { flexDirection: 'row', alignItems: 'center' },

  toggleBlock: { marginTop: 8 },
  toggleRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  smallText: { fontSize: 13, color: '#6B7280' },

  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  ghostButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E6E9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  ghostText: { color: '#0369A1', fontWeight: '700' },

  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E6E6E9' },

  logoutButton: { backgroundColor: '#ffebeb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#b91c1c', fontWeight: '700' },

  switchRowSimple: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },

  dropdownWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E6E9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 150,
    justifyContent: 'space-between',
  },
  dropdownList: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E6E9',
    borderRadius: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
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
separator: {
  height: 1,
  backgroundColor: '#E6E6E9',
  marginVertical: 8,
},
emptyText: {
  textAlign: 'center',
  color: '#999',
  paddingVertical: 16,
  fontSize: 14,
},
});
