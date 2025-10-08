import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '@/services/supabase';
import { router } from 'expo-router';

export default function TabsLayout() {
  const [checking, setChecking] = useState(true);

  const [accountType, setAccountType] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/(auth)/login');
        return;
      }
      
      const userId = data.user.id;
      
      const { data: churchData } = await supabase
        .from('church')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (churchData) {
        setAccountType('church');
      } else {
        setAccountType('user');
      }
      
      setChecking(false);
    };

    checkAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/(auth)/login');
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
     <Tabs.Screen 
      name="church" 
      options={{ href: accountType === 'church' ? undefined : null }} 
    />
    
     <Tabs.Screen 
      name="user" 
      options={{ href: accountType === 'user' ? undefined : null }} 
    />

    <Tabs.Screen name="give" options={{ title: 'Give', href: accountType === 'church' ? null : undefined }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
