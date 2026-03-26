import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFitnessStore } from '@/store/useFitnessStore';
import { format } from 'date-fns';

export default function SchedulesScreen() {
  const { workouts, assignSchedule, schedules } = useFitnessStore();
  const [userId, setUserId] = useState('usr_123'); // Default mock user
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAssign = () => {
    if (!selectedWorkoutId) {
      alert('Please select a workout');
      return;
    }
    assignSchedule({
      userId,
      workoutId: selectedWorkoutId,
      date,
      completed: false
    });
    alert('Workout successfully assigned!');
    setSelectedWorkoutId('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Workout</Text>

      <View style={styles.form}>
        <Text style={styles.label}>User ID</Text>
        <TextInput style={styles.input} value={userId} onChangeText={setUserId} placeholderTextColor="#888" />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholderTextColor="#888" />

        <Text style={styles.label}>Select Workout</Text>
        <ScrollView style={styles.workoutList}>
          {workouts.map(w => (
            <TouchableOpacity 
              key={w.id} 
              style={[styles.workoutItem, selectedWorkoutId === w.id && styles.selectedItem]}
              onPress={() => setSelectedWorkoutId(w.id)}
            >
              <Text style={styles.workoutItemTitle}>{w.title}</Text>
              <Text style={styles.workoutItemType}>{w.type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={handleAssign}>
          <Text style={styles.submitButtonText}>Assign Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 24, paddingTop: 64 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 32 },
  form: { flex: 1 },
  label: { color: '#A0A0A0', fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  workoutList: { maxHeight: 250, marginTop: 8 },
  workoutItem: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'transparent' },
  selectedItem: { borderColor: '#00FF66', backgroundColor: '#1A2A1A' },
  workoutItemTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  workoutItemType: { color: '#A0A0A0' },
  submitButton: { backgroundColor: '#00FF66', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 32, shadowColor: '#00FF66', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  submitButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
