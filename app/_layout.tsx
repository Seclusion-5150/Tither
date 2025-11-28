import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <StripeProvider publishableKey="pk_test_51SYXtUPbHSh2XQ06s354vqBCAEEU53DEduX6CheBTtayGxia794QCPyNLUMeCeruMUuTbBa56wlwDYAITmkBDqBy00pWMHe3pB">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </StripeProvider>
  );
}
