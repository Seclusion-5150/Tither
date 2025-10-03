import { StyleSheet, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';

export default function GiveScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Give</Text>
      <Text style={styles.bodyText}>Create a donation or giving flow here.</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  bodyText: { marginTop: 12, fontSize: 16 },
});