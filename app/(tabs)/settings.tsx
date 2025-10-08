import { supabase } from '@/services/supabase';
import { router } from 'expo-router';
import { Alert, Pressable, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';  // Add this import
import ParallaxScrollView from '@/components/parallax-scroll-view';

export default function SettingsScreen() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log('Logout error:', error);
      Alert.alert('Error', 'Failed to log out');
      return;
    }
    router.replace('/(auth)/login'); // redirect to login after logout
  };

  return (
    
  <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
      headerImage={
        <Image
          source={require('@/assets/images/Tither_Logo.png')}
          style={styles.titherLogo}
        />
      }
    >
   <ThemedView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.bodyText}>Profile, preferences, and sign out live here.</Text>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ThemedView>
  </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  bodyText: { fontSize: 16, marginBottom: 24 },
  logoutButton: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },

  titherLogo: {  // Add this style
    height: 178,
    width: 290,
    bottom: 0,
    left: 72,
    position: 'absolute',
  },
});
