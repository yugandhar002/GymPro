import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Clock } from 'lucide-react-native';

export default function PendingScreen() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Clock color="#00FF66" size={64} style={{ marginBottom: 24 }} />
      <Text style={styles.title}>Under Review</Text>
      <Text style={styles.subtitle}>Your registration was successful. You are currently waiting for approval from the Gym Owner. Please check back later.</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Return to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#A0A0A0', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  logoutButton: { backgroundColor: '#1E1E1E', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
