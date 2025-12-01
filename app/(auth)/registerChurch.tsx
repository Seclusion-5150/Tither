import { supabase } from '@/services/supabase';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.0.66:8081';
console.log('API_BASE =', API_BASE); 

function validateEINFormat(ein: string) {
  const cleanEIN = (ein || '').replace(/-/g, '');
  return /^\d{9}$/.test(cleanEIN);
}

// Backend returns BOTH the account id and the onboarding URL
async function createAccountAndOnboardingLink(
  maybeAccountId?: string
): Promise<{ accountId: string; url: string }> {
  const res = await fetch(`${API_BASE}/api/connect/account`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      accountId: maybeAccountId, 
    }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Create onboarding failed (${res.status}): ${msg}`);
  }
  return res.json();
}

async function openOnboardingUrl(url: string) {
  // Native: use an auth-style session so we can return to the app nicely.
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // Optional: configure return URL in your server to deep-link back with Linking.createURL('/')
    const result = await WebBrowser.openAuthSessionAsync(url, Linking.createURL('/onboarding/return'));
    // result.type can be 'success' | 'cancel' | 'dismiss' etc.
    return result;
  }
  // Web fallback
  if (typeof window !== 'undefined') {
    window.location.assign(url);
  } else {
    await WebBrowser.openBrowserAsync(url);
  }
}

export default function RegistrationScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [churchName, setChurchName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ein, setEin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const registerChurch = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // 1) Basic client-side validation
      if (!email || !password || !username || !churchName || !phoneNumber) {
        Alert.alert('Missing info', 'Please fill out all fields.');
        return;
      }
      if (!validateEINFormat(ein)) {
        Alert.alert('Invalid EIN', 'EIN must be 9 digits (dashes optional).');
        return;
      }

      // 2) Create auth user
      const { error: authError, data: authData } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError || !authData?.user?.id) {
        console.log('Auth error:', authError);
        Alert.alert('Error', 'Failed to sign up.');
        return;
      }
      const userId = authData.user.id;

      // 3) Insert church profile (without Stripe id yet)
      const cleanEin = ein.replace(/-/g, '');
      const { error: churchInsertError } = await supabase
  	.from('church')
  	.upsert({ 
    	 id: userId,
    	 username,
    	 ein: cleanEin,
    	 name: churchName,
    	 validated: false,
    	 phone: phoneNumber,
      }, {
    	onConflict: 'id' 
      });
      if (churchInsertError) {
        console.log('Church insert error:', churchInsertError);
        Alert.alert('Error', 'Failed to save church record.');
        return;
      }

      // 4) OPTIONAL: if you ever stored a previously created account, fetch it first
      // const { data: existingChurch } = await supabase
      //   .from('church')
      //   .select('stripe_account_id')
      //   .eq('id', userId)
      //   .single();
      // const existingAccountId = existingChurch?.stripe_account_id ?? undefined;

      // 5) Create (or reuse) Stripe account AND get onboarding link from your API
      const { accountId, url } = await createAccountAndOnboardingLink(/* existingAccountId */);

      // 6) Save the Stripe account id to your church row
      const { error: updateError } = await supabase
        .from('church')
        .update({ stripe_account_id: accountId })
        .eq('id', userId);

      if (updateError) {
        console.log('Stripe account id update error:', updateError);
        Alert.alert('Warning', 'Created Stripe account but failed to store its ID.');
        // continue anyway so they can at least complete onboarding
      }

      // 7) Open onboarding
      await openOnboardingUrl(url);

      // 8) Let the user know (and route them)
      Alert.alert('Almost there', 'Finish Stripe onboarding to enable payouts.');
      router.push('./login');
    } catch (err: any) {
      console.log('Registration flow failed:', err);
      Alert.alert('Error', err?.message ?? 'Something went wrong creating your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ParallaxScrollView
        contentContainerStyle={{ paddingBottom: 400 }}
        headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
        headerImage={
          <Image
            source={require('@/assets/images/Tither_Logo.png')}
            style={styles.titherLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Register</ThemedText>
        </ThemedView>

        <ThemedView style={styles.labelContainer}>
          <ThemedText type="subtitle">Username</ThemedText>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        </ThemedView>

        <ThemedView style={styles.labelContainer}>
          <ThemedText type="subtitle">Password</ThemedText>
          <TextInput style={styles.input} value={password} secureTextEntry onChangeText={setPassword} />
        </ThemedView>

        <ThemedView style={styles.labelContainer}>
          <ThemedText type="subtitle">E-mail</ThemedText>
          <TextInput style={styles.input} value={email} autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} />
        </ThemedView>

        <ThemedView style={styles.labelContainer}>
          <ThemedText type="subtitle">Church Name</ThemedText>
          <TextInput style={styles.input} value={churchName} onChangeText={setChurchName} />
        </ThemedView>

        <ThemedView style={styles.labelContainer}>
          <ThemedText type="subtitle">EIN</ThemedText>
          <TextInput style={styles.input} value={ein} onChangeText={setEin} placeholder="12-3456789 or 123456789" />
        </ThemedView>

        <ThemedView style={styles.labelContainer}>
          <ThemedText type="subtitle">Phone Number</ThemedText>
          <TextInput style={styles.input} value={phoneNumber} keyboardType="phone-pad" onChangeText={setPhoneNumber} />
        </ThemedView>

        <Pressable style={[styles.registerButton, submitting && { opacity: 0.6 }]} onPress={registerChurch} disabled={submitting}>
          <Text style={styles.loginButtonText}>{submitting ? 'Submitting…' : 'Register Now'}</Text>
        </Pressable>
      </ParallaxScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titherLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 72,
    position: 'absolute',
  },
  labelContainer: {
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  registerButton: {
    height: 44,
    width: 180,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
