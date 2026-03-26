import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true, 
      headerStyle: { backgroundColor: '#121212' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerBackTitle: 'Back'
    }}>
      <Stack.Screen name="members/index" options={{ title: 'Gym Members' }} />
      <Stack.Screen name="members/[id]" options={{ title: 'Edit Schedule' }} />
    </Stack>
  );
}
