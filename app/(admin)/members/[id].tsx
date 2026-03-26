import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMembersStore } from '@/store/useMembersStore';
import { useScheduleStore, WeeklySchedule } from '@/store/useScheduleStore';
import { Save, User, Target } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WORKOUT_TYPES = [
  'Rest Day', 
  'Chest & Triceps Day', 
  'Back & Biceps Day', 
  'Leg Day', 
  'Shoulders & Core Day', 
  'Full Body Day', 
  'Cardio Day'
];

export default function MemberScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { members } = useMembersStore();
  const { userSchedules, loading, fetchUserSchedules, upsertSchedule } = useScheduleStore();
  
  const member = members.find(m => m.id === id);
  const [localSchedules, setLocalSchedules] = useState<Partial<WeeklySchedule>[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserSchedules(id);
    }
  }, [id]);

  useEffect(() => {
    const schedules = userSchedules[id as string] || [];
    const initial = DAYS.map((_, index) => {
      const existing = schedules.find(s => s.day_of_week === index);
      return existing || { day_of_week: index, workout_type: 'Rest Day', exercises: '' };
    });
    setLocalSchedules(initial);
  }, [userSchedules, id]);

  const updateDay = (index: number, field: string, value: any) => {
    const updated = [...localSchedules];
    updated[index] = { ...updated[index], [field]: value };
    setLocalSchedules(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const sched of localSchedules) {
        await upsertSchedule(
          id as string, 
          sched.day_of_week!, 
          sched.workout_type || 'Rest Day', 
          sched.exercises || ''
        );
      }
      Alert.alert('Success', 'Weekly schedule updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save schedule.');
    } finally {
      setSaving(false);
    }
  };

  if (!member) {
    return <View style={styles.centered}><Text style={{color: '#fff'}}>Member not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}><User color="#00FF66" size={32} /></View>
            <View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
          </View>
          <View style={styles.goalRow}>
            <Target color="#A0A0A0" size={16} />
            <Text style={styles.goalText}>Goal: {member.fitness_goal || 'Not specified'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Weekly Workout Plan</Text>

        {localSchedules.map((dayPlan, index) => (
          <View key={index} style={styles.dayCard}>
            <Text style={styles.dayName}>{DAYS[index]}</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={dayPlan.workout_type}
                onValueChange={(val) => updateDay(index, 'workout_type', val)}
                style={styles.picker}
                dropdownIconColor="#00FF66"
                mode="dropdown" // Improved behavior on many Android versions
              >
                {WORKOUT_TYPES.map(type => (
                  <Picker.Item key={type} label={type} value={type} color="#000" />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Exercises (e.g. Squats, Lunges)"
              placeholderTextColor="#555"
              value={dayPlan.exercises}
              onChangeText={(text) => updateDay(index, 'exercises', text)}
              multiline
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#000" /> : (
            <>
              <Save color="#000" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Save Weekly Schedule</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  profileCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#333' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  memberName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  memberEmail: { color: '#888', fontSize: 14 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#121212', padding: 12, borderRadius: 12 },
  goalText: { color: '#A0A0A0', fontSize: 14, flex: 1 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16, marginLeft: 4 },
  dayCard: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  dayName: { color: '#00FF66', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  pickerContainer: { backgroundColor: '#121212', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  picker: { color: '#fff', height: 50 },
  input: { backgroundColor: '#121212', color: '#fff', padding: 12, borderRadius: 12, fontSize: 15, minHeight: 60, textAlignVertical: 'top' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#121212', borderTopWidth: 1, borderTopColor: '#333' },
  saveButton: { backgroundColor: '#00FF66', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 14 },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: '800' }
});
