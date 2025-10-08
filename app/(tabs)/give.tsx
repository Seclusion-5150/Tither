import { StyleSheet, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Image } from 'expo-image';  // Add this import

export default function GiveScreen() {
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
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Give</Text>
      <Text style={styles.bodyText}>Create a donation or giving flow here.</Text>
    </ThemedView>
  </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  bodyText: { marginTop: 12, fontSize: 16 },
  titherLogo: {  // Add this style
    height: 178,
    width: 290,
    bottom: 0,
    left: 72,
    position: 'absolute',
  },
});
