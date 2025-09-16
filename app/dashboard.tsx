import { supabase } from '@/services/supabase';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { Alert } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Dimensions } from 'react-native';

export default function RegistrationScreen() {
  
  return (
	
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
        headerImage={
        <Image
          source={require('@/assets/images/Tither_Logo.png')}
          style={styles.titherLogo}
        />
        }>
	  <ThemedView style={styles.dashboardWidget}>
		<ThemedText style={styles.dashboardWidgetText}>Welcome to your Dashboard!</ThemedText>
	  </ThemedView>
      </ParallaxScrollView>	
	
  );
}

const { width , height } = Dimensions.get('window');

const styles = StyleSheet.create(
{

  dashboardWidget: {
	width: 250,
	height: 100,
	backgroundColor: 'white',
	margin: 20,
	padding: 10,
	alignItems: 'center',
  },
  dashboardWidgetText: {
	color: '#000',
	fontSize: 16,
	fontWeight: 'bold',
  },
  titherLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 72,
    position: 'absolute',
  },
}); 
