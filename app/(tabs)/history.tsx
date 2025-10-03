import { StyleSheet, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';

export default function HistoryScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text style={[styles.bodyText, { fontWeight: 'bold', fontSize: 20 }]}>History</Text>
      <Text style={styles.bodyText}>Transaction and activity history will appear here.</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  bodyText: { marginTop: 12, fontSize: 16 },
});