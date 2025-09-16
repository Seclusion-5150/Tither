import { register } from './';

import { useState } from 'react';
import { TextInput } from 'react-native';
import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';

import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');  
  const [password, setPassword] = useState('');
  
  const goToRegister = () => {
    router.push('/register');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
      headerImage={
        <Image
          source={require('@/assets/images/Tither_Logo.png')}
          style={styles.titherLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome Back!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Username</ThemedText>
     	<TextInput style={styles.input} value={username}
       	onChangeText={setUsername} placeholder="Username"
	/> 
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Password</ThemedText>	
     	<TextInput style={styles.input} value={password}
       	onChangeText={setPassword} placeholder="Password" 
     	 />
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
      <Pressable 
      	style={styles.loginButtons} 
      	onPress={() => console.log('Login pressed')}>
      	<Text style={styles.loginButtonText}>Login</Text>
      </Pressable>
      <Pressable
      	style={styles.loginButtons}
	onPress={goToRegister}>
      	<Text style={styles.loginButtonText}>Register</Text>
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
    height: 178,
    width: 290,
    bottom: 0,
    left: 72,
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
  	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginTop: 20,
  },
  loginButtons: {
  	height: 44,
	width: 100,
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

