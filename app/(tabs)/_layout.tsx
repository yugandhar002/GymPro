import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { Activity, Dumbbell, Calendar } from 'lucide-react-native';

export default function TabLayout() {
  const role = useAuthStore(state => state.user?.role);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00FF66',
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute', backgroundColor: '#1A1A1A', borderTopWidth: 0 },
          default: { backgroundColor: '#1A1A1A', borderTopWidth: 0 },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: 'Schedules',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          href: role === 'admin' ? '/(tabs)/schedules' : null, // Only admin can assign schedules
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide the default explore tab
        }}
      />
    </Tabs>
  );
}
