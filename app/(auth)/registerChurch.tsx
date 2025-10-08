import { supabase } from '@/services/supabase';
import { useState } from 'react';
import { TextInput , Pressable, Text , Platform, StyleSheet , Alert } from 'react-native';
import { router , Link } from 'expo-router';
import { Image } from 'expo-image';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { KeyboardAvoidingView, ScrollView } from 'react-native';

function validateEINFormat(ein) {
  // Remove any dashes
  const cleanEIN = ein.replace(/-/g, '');
  
  // Check if it's 9 digits
  if (!/^\d{9}$/.test(cleanEIN)) {
    return false;
  }
  
  return true;
}
export default function RegistrationScreen() {
  	const [username, setUsername] = useState('');  
  	const [password, setPassword] = useState('');
  	const [email, setEmail] = useState('');
	const [churchName, setChurchName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [ein, setEin] = useState('');
 	
	const registerChurch = async () => {
	
	  const { error: authError, data: authData } = await supabase.auth.signUp({
  		email: email,
  		password: password});
	
	  if (authError) {
		Alert.alert('Error', 'Failed to sign up');
		console.log("Error: ", authError)
		return;
	  }

	  if(!validateEINFormat(ein))
	  {
		  Alert.alert('Invalid EIN', 'EIN incorrectly Formatted. Try again.');
		  return;
	  }	  
	  const { error: userError, data: userData } = await supabase
  	    .from("church")
  	    .insert({
    	    id: authData.user?.id,
    	    username: username,
   	    ein: ein,
    	    name: churchName,
	    validated: false, 
	    phone: phoneNumber,
  	    });
	
	
	  if (userError) {
		Alert.alert('Error', 'Failed to update church database');
		console.log('Error: ', userError)
		return;
	  }
	  Alert.alert('Success', 'Successfully Created Church Account!');
	  router.push('./login');
   	};
	

	return (
	<KeyboardAvoidingView
	  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
	  style={{ flex: 1 }}
	  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
	  >
		<ParallaxScrollView	
        	contentContainerStyle={{ paddingBottom: 400 }} // Add this!
      		headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
		headerImage={
        	<Image
          		source={require('@/assets/images/Tither_Logo.png')}
          		style={styles.titherLogo}
        	/>
		}>
		  <ThemedView style={styles.titleContainer}>
		  <ThemedText type="title">Register</ThemedText>
		</ThemedView>
		<ThemedView style={styles.labelContainer}>
		  <ThemedText type="subtitle">Username</ThemedText>
     		  <TextInput style={styles.input} value={username} 
		  onChangeText={setUsername}/>
		</ThemedView>
		<ThemedView style={styles.labelContainer}>
		  <ThemedText type="subtitle">Password</ThemedText>	
     		  <TextInput style={styles.input} value={password}
		  onChangeText={setPassword} />
		</ThemedView>
		<ThemedView style={styles.labelContainer}>
		  <ThemedText type="subtitle">E-mail</ThemedText>
     		  <TextInput style={styles.input} value={email} 
		  onChangeText={setEmail}  />
		</ThemedView>
		<ThemedView style={styles.labelContainer}>
		  <ThemedText type="subtitle">Church Name</ThemedText>
     		  <TextInput style={styles.input} value={churchName}
		  onChangeText={setChurchName} />
		</ThemedView>
		  <ThemedView style={styles.labelContainer}>
		  <ThemedText type="subtitle">EIN</ThemedText>
     		  <TextInput style={styles.input} value={ein}
		  onChangeText={setEin} />
		</ThemedView>
		<ThemedView style={styles.labelContainer}>
		 <ThemedText type="subtitle">Phone Number</ThemedText>
     		 <TextInput style={styles.input} value={phoneNumber}
		 onChangeText={setPhoneNumber} />
		</ThemedView>

      		<Pressable
      		  style={styles.registerButton}
		  onPress={registerChurch}>
      		  <Text style={styles.loginButtonText}>Register Now</Text>
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
	width: 150,
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



