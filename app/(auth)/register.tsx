import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    if (!name || !email || !password || !weight) {
      alert("Name, email, password, and weight are required!");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    await register(password, { name, email, dob, address, weight, height, fitness_goal: fitnessGoal });
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Join <Text style={styles.brandAccent}>GYMPRO</Text></Text>
        <Text style={styles.subtitle}>Create your secure cloud profile</Text>
        
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Full Name *" placeholderTextColor="#888" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email *" placeholderTextColor="#888" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password (min 6 chars) *" placeholderTextColor="#888" value={password} onChangeText={setPassword} secureTextEntry />
          
          <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" placeholderTextColor="#888" value={dob} onChangeText={setDob} />
          <TextInput style={styles.input} placeholder="Address" placeholderTextColor="#888" value={address} onChangeText={setAddress} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Weight * (e.g. 75kg)" placeholderTextColor="#888" value={weight} onChangeText={setWeight} />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="Height (e.g. 180cm)" placeholderTextColor="#888" value={height} onChangeText={setHeight} />
          </View>
          <TextInput style={styles.input} placeholder="Primary Fitness Goal" placeholderTextColor="#888" value={fitnessGoal} onChangeText={setFitnessGoal} />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Submit Registration</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { padding: 24, paddingTop: 64, paddingBottom: 64 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 8, letterSpacing: 1 },
  brandAccent: { color: '#00FF66' },
  subtitle: { fontSize: 16, color: '#A0A0A0', textAlign: 'center', marginBottom: 32 },
  inputContainer: { marginBottom: 32 },
  input: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  primaryButton: { backgroundColor: '#00FF66', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#00FF66', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#00FF66', textAlign: 'center', fontSize: 16 }
});
