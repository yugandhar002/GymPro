import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) return alert("Email and Password required!");
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      // Error handled silently here because store alerts the user, but we clear loading state
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>GYM<Text style={styles.brandAccent}>PRO</Text></Text>
        <Text style={styles.subtitle}>Welcome back to your fitness journey</Text>
        
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Secure Log In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ marginTop: 32 }}>
          <Text style={styles.linkText}>Don't have an account? <Text style={{ fontWeight: 'bold' }}>Register Now</Text></Text>
        </TouchableOpacity>

        <Text style={{color: '#555', textAlign: 'center', marginTop: 48, fontSize: 12}}>
          Admin setup: Register an account normally, log into your Supabase Dashboard online, edit your 'profiles' row, and set your role to 'admin' to unlock Owner features.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 42, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 8, letterSpacing: 2 },
  brandAccent: { color: '#00FF66' },
  subtitle: { fontSize: 16, color: '#A0A0A0', textAlign: 'center', marginBottom: 48 },
  inputContainer: { marginBottom: 32 },
  input: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  primaryButton: { backgroundColor: '#00FF66', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 16, shadowColor: '#00FF66', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#A0A0A0', textAlign: 'center', fontSize: 16 }
});
