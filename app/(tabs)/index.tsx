import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { Activity, Flame, Play, Calendar, UserCheck } from 'lucide-react-native';
import { format } from 'date-fns';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DashboardScreen() {
  const { user, logout, pendingUsers, approveUser, denyUser } = useAuthStore();
  const { userSchedules, loading, fetchUserSchedules, logWorkout } = useScheduleStore();
  
  const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);
  const isOwner = user?.role === 'admin';
  const todayIndex = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    if (user?.id) {
      fetchUserSchedules(user.id);
    }
  }, [user?.id]);

  const schedules = userSchedules[user?.id || ''] || [];
  const selectedWorkout = schedules.find(s => s.day_of_week === selectedDay);
  const todayWorkout = schedules.find(s => s.day_of_week === todayIndex);

  const handleStartWorkout = async () => {
    if (!todayWorkout) return;
    try {
      await logWorkout(user!.id, todayWorkout.workout_type);
      Alert.alert('Success', 'Workout started! Go get it!');
    } catch (e) {
      Alert.alert('Error', 'Failed to log workout.');
    }
  };

  const handleApprove = (id: string, name: string) => {
    approveUser(id);
    Alert.alert('Approved', `${name} has been granted access to the gym app!`);
  };

  const handleDeny = (id: string, name: string) => {
    denyUser(id);
    Alert.alert('Denied', `${name}'s request was denied.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, {user?.name.split(' ')[0]}</Text>
          <Text style={styles.dateText}>{format(new Date(), 'EEEE, do MMMM')}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {!isOwner && (
        <View style={{ paddingHorizontal: 24 }}>
          {/* Today's Hero Card */}
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          <View style={styles.heroCard}>
            {loading ? <ActivityIndicator color="#00FF66" /> : (
              <>
                <View style={styles.heroContent}>
                  <Text style={styles.heroDay}>{DAYS[todayIndex]} Day</Text>
                  <Text style={styles.heroTitle}>{todayWorkout?.workout_type || 'Rest Day'}</Text>
                  <Text style={styles.heroExercises} numberOfLines={2}>
                    {todayWorkout?.exercises || 'No specific exercises set. Focus on recovery!'}
                  </Text>
                </View>
                {todayWorkout && todayWorkout.workout_type !== 'Rest Day' && (
                  <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
                    <Play color="#000" size={20} fill="#000" />
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Weekly Strip */}
          <View style={styles.weeklyStrip}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(index)}
                style={[
                  styles.dayPill,
                  selectedDay === index && styles.activeDayPill,
                  todayIndex === index && styles.todayPill
                ]}
              >
                <Text style={[styles.dayPillText, selectedDay === index && styles.activeDayPillText]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Day View */}
          <View style={styles.selectedDayCard}>
            <View style={styles.selectedDayHeader}>
              <Calendar color="#00FF66" size={18} />
              <Text style={styles.selectedDayTitle}>{DAYS[selectedDay]} Plan</Text>
            </View>
            <Text style={styles.selectedWorkoutType}>{selectedWorkout?.workout_type || 'Rest Day'}</Text>
            <Text style={styles.selectedExercises}>
              {selectedWorkout?.exercises || 'Enjoy your day off! Recovery is key to growth.'}
            </Text>
          </View>

          {/* Stats Placeholder */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Daily Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Activity color="#00FF66" size={24} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>1,240</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            <View style={styles.statCard}>
              <Flame color="#FF4500" size={24} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>450</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </View>
      )}

      {/* Admin Controls Section */}
      {isOwner && (
        <View style={{ paddingHorizontal: 24 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Admin Controls</Text>
            <TouchableOpacity 
              style={styles.manageButton} 
              onPress={() => router.push('/(admin)/members' as any)}
            >
              <Text style={styles.manageButtonText}>Manage Members →</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { fontSize: 16, marginTop: 16, color: '#A0A0A0' }]}>Pending Approvals</Text>
          {pendingUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No pending user requests right now.</Text>
            </View>
          ) : (
            pendingUsers.map(u => (
              <View key={u.id} style={styles.userCard}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.userName}>{u.name} <Text style={styles.userAge}>({u.age || '?'} yrs)</Text></Text>
                  <Text style={styles.userDetail}>{u.email}</Text>
                  <Text style={styles.userGoal}>Goal: {u.fitness_goal || 'None'}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.circleButton, { backgroundColor: '#1E1E1E', borderColor: '#FF4500' }]} onPress={() => handleDeny(u.id, u.name)}>
                    <Activity color="#FF4500" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.circleButton, { backgroundColor: '#00FF66', borderColor: '#00FF66' }]} onPress={() => handleApprove(u.id, u.name)}>
                    <UserCheck color="#000" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { paddingHorizontal: 24, paddingVertical: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 26, fontWeight: '800', color: '#fff' },
  dateText: { fontSize: 14, color: '#A0A0A0', marginTop: 4 },
  logoutButton: { padding: 8 },
  logoutText: { color: '#00FF66', fontSize: 13, fontWeight: '600' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  heroCard: { backgroundColor: '#1E1E1E', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333', minHeight: 140 },
  heroContent: { flex: 1 },
  heroDay: { color: '#00FF66', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  heroExercises: { color: '#A0A0A0', fontSize: 14, lineHeight: 22 },
  startButton: { backgroundColor: '#00FF66', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, gap: 8 },
  startButtonText: { color: '#000', fontWeight: '800', fontSize: 15 },

  weeklyStrip: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 24 },
  dayPill: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  todayPill: { borderColor: '#00FF6660' },
  activeDayPill: { backgroundColor: '#00FF66', borderColor: '#00FF66' },
  dayPillText: { color: '#888', fontSize: 12, fontWeight: '700' },
  activeDayPillText: { color: '#000' },

  selectedDayCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#333' },
  selectedDayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  selectedDayTitle: { color: '#A0A0A0', fontSize: 14, fontWeight: '600' },
  selectedWorkoutType: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  selectedExercises: { color: '#888', fontSize: 14, lineHeight: 22 },

  statsContainer: { flexDirection: 'row', gap: 16 },
  statCard: { flex: 1, backgroundColor: '#1E1E1E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#333' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  manageButton: { backgroundColor: '#00FF6620', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#00FF6640' },
  manageButtonText: { color: '#00FF66', fontSize: 13, fontWeight: '600' },
  
  emptyState: { backgroundColor: '#1E1E1E', padding: 24, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
  emptyStateText: { color: '#666', fontSize: 14, fontStyle: 'italic' },
  
  userCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  userName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  userAge: { fontWeight: 'normal', color: '#A0A0A0' },
  userDetail: { color: '#888', fontSize: 13, marginBottom: 2 },
  actionRow: { flexDirection: 'row', gap: 8 },
  circleButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }
});
