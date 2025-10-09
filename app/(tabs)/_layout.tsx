import React from 'react';
import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#00a6ffff',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="give"
        options={{
          title: 'Give',
          tabBarIcon: ({ color }) => <Feather name="credit-card" size={20} color={color} />,
        }}
        
      />
      <Tabs.Screen name="give" options={{ title: 'Give' }}  />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 80,
    borderTopWidth: 0,
    paddingHorizontal: 8,
    paddingTop: 8,
    justifyContent: 'center',
  },
});