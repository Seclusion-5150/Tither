import { register } from '..';
import { supabase } from '@/services/supabase';
import { Alert } from 'react-native';
import { useState } from 'react';
import { TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const goToRegister = () => {
    router.push('/register');
  };

  const handleLogin = async () => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      console.log('Auth Error: ', authError);
      Alert.alert('Error', 'Login Error: Incorrect Email or Password');
      return;
    }

    const userId = authData.user?.id;
    console.log('Logged in user ID:', userId);

    // Check church table first
    const { data: churchData, error: churchError } = await supabase
      .from('church')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Church query result:', { churchData, churchError });

    if (churchData && !churchError) {
      console.log('Church account found!');
      router.replace('/(church-tabs)/dashboard');
      return;
    }

    // Check user table
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('User query result:', { userData, userError });

    if (userData && !userError) {
      console.log('User account found!');
      router.replace('/(tabs)/dashboard');
      return;
    }

    console.log('No profile found in either table');
    Alert.alert('Error', 'Account profile not found');
  };

  const goToChurch = () => {
  	router.push('/registerChurch');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
      headerImage={
        <Image
          source={require('@/assets/images/tither_banner.png')}
          style={styles.titherLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome Back!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Email</ThemedText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Password</ThemedText>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Pressable
          style={styles.loginButtons}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </Pressable>
       </ThemedView>
       <ThemedView style={styles.registerButtonContainer}>
	<Pressable
          style={styles.loginButtons}
          onPress={goToRegister}
        >
          <Text style={styles.loginButtonText}>Register</Text>
        </Pressable>
	  <Pressable
	    style={styles.loginButtons}
	    onPress={goToChurch}
	    >
	      <Text style={styles.loginButtonText}>Register Church</Text>
	    </Pressable>
	</ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  titherLogo: {
    height: 175,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
  },

  registerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 12
  },

  loginButtons: {
    height: 44,
    flex: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
