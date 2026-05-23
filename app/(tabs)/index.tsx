import { useAuthStore } from '@/store/useAuthStore';
import { useMembersStore } from '@/store/useMembersStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { Activity, Calendar, Flame, Timer, Trophy, UserCheck, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MET_VALUES: Record<string, Record<string, number>> = {
  'Cardio Day': { light: 5.0, moderate: 7.0, intense: 10.0 },
  'Leg Day': { light: 4.0, moderate: 6.0, intense: 8.0 },
  'Full Body Day': { light: 4.5, moderate: 6.5, intense: 9.0 },
  'Chest & Triceps Day': { light: 3.5, moderate: 5.5, intense: 7.5 },
  'Back & Biceps Day': { light: 3.5, moderate: 5.5, intense: 7.5 },
  'Shoulders & Core Day': { light: 3.5, moderate: 5.0, intense: 7.0 },
};

export default function DashboardScreen() {
  const { user, logout, pendingUsers, approveUser, denyUser } = useAuthStore();
  const { userSchedules, todayLog, loading, fetchUserSchedules, fetchTodayLog, saveWorkoutLog } = useScheduleStore();
  const { members, fetchMembers } = useMembersStore();

  const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'intense'>('moderate');
  const [isCalculating, setIsCalculating] = useState(false);

  const isOwner = user?.role === 'admin';
  const todayIndex = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    if (user?.id) {
      fetchUserSchedules(user.id);
      fetchTodayLog(user.id);
    }
    if (user?.role === 'admin') {
      fetchMembers();
    }
  }, [user?.id]);

  const schedules = userSchedules[user?.id || ''] || [];
  const selectedWorkout = schedules.find(s => s.day_of_week === selectedDay);
  const todayWorkout = schedules.find(s => s.day_of_week === todayIndex);

  const calculateCalories = () => {
    if (!todayWorkout || todayWorkout.workout_type === 'Rest Day') return 0;
    const weight = parseFloat(user?.weight || '70');
    const dur = parseFloat(duration || '0');
    const met = MET_VALUES[todayWorkout.workout_type]?.[intensity] || 5.0;
    return Math.round(met * weight * (dur / 60));
  };

  const handleSaveLog = async () => {
    if (!duration || isNaN(parseFloat(duration))) {
      Alert.alert('Invalid Duration', 'Please enter a valid number of minutes.');
      return;
    }

    setIsCalculating(true);
    try {
      const calories = calculateCalories();
      await saveWorkoutLog({
        user_id: user!.id,
        date: new Date().toISOString().split('T')[0],
        workout_type: todayWorkout?.workout_type || 'Custom',
        duration_minutes: parseInt(duration),
        intensity: intensity,
        calories_burned: calories,
        completed: true
      });
      setDuration('');
      Alert.alert('Session Saved!', `Great job ${user?.name.split(' ')[0]}! You crushed it.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save workout log.');
    } finally {
      setIsCalculating(false);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name.split(' ')[0]}</Text>
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
                {todayWorkout && todayWorkout.workout_type !== 'Rest Day' && !todayLog?.completed && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Active</Text>
                  </View>
                )}
                {todayLog?.completed && (
                  <View style={[styles.statusBadge, { backgroundColor: '#00FF6620' }]}>
                    <UserCheck color="#00FF66" size={16} />
                    <Text style={[styles.statusBadgeText, { color: '#00FF66' }]}>Done</Text>
                  </View>
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

          {/* Log Progress Result (Reactive) */}
          {todayLog?.completed && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Trophy color="#FFD700" size={24} />
                <Text style={styles.resultTitle}>Great session, {user?.name.split(' ')[0]}!</Text>
              </View>
              <Text style={styles.resultBody}>
                You burned around <Text style={styles.resultHighlight}>{todayLog.calories_burned}</Text> calories in {todayLog.duration_minutes} minutes at {todayLog.intensity} intensity.
              </Text>
            </View>
          )}

          {/* Detailed Workout Logger Section */}
          {!isOwner && todayWorkout?.workout_type !== 'Rest Day' && (
            <View style={styles.logSection}>
              <Text style={styles.sectionTitle}>Log Today's Workout</Text>
              <View style={styles.logCard}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <Timer color="#00FF66" size={18} />
                    <Text style={styles.inputLabel}>Duration (minutes)</Text>
                  </View>
                  <TextInput
                    style={styles.numericInput}
                    placeholder="e.g. 45"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={duration}
                    onChangeText={setDuration}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <Zap color="#00FF66" size={18} />
                    <Text style={styles.inputLabel}>Intensity</Text>
                  </View>
                  <View style={styles.intensityRow}>
                    {(['light', 'moderate', 'intense'] as const).map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[styles.intensityPill, intensity === level && styles.activeIntensityPill]}
                        onPress={() => setIntensity(level)}
                      >
                        <Text style={[styles.intensityText, intensity === level && styles.activeIntensityText]}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.calculateButton, isCalculating && { opacity: 0.7 }]}
                  onPress={handleSaveLog}
                  disabled={isCalculating}
                >
                  {isCalculating ? <ActivityIndicator color="#000" /> : <Text style={styles.calculateButtonText}>Calculate & Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {todayWorkout?.workout_type === 'Rest Day' && (
            <View style={styles.restDayNotice}>
              <Text style={styles.restDayText}>It's a rest day, no logging needed. Enjoy your recovery! 🧘</Text>
            </View>
          )}

          {/* Selected Day View */}
          {/* <View style={[styles.selectedDayCard, { marginTop: 24 }]}>
            <View style={styles.selectedDayHeader}>
              <Calendar color="#00FF66" size={18} />
              <Text style={styles.selectedDayTitle}>{DAYS[selectedDay]} Plan</Text>
            </View>
            <Text style={styles.selectedWorkoutType}>{selectedWorkout?.workout_type || 'Rest Day'}</Text>
            <Text style={styles.selectedExercises}>
              {selectedWorkout?.exercises || 'Enjoy your day off! Recovery is key to growth.'}
            </Text>
          </View> */}

          {/* Stats Section */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Daily Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Flame color="#FF4500" size={24} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{todayLog?.calories_burned || 0}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Activity color="#00FF66" size={24} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>1,240</Text>
              <Text style={styles.statLabel}>Steps</Text>
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

          {/* Today's Member Progress */}
          <Text style={[styles.sectionTitle, { fontSize: 16, marginTop: 24, color: '#A0A0A0' }]}>Today's Member Progress</Text>
          {members.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No approved members yet.</Text>
            </View>
          ) : (
            members.map(m => {
              const didWorkout = m.todayCompleted;
              const isRestDay = m.todayWorkoutType === 'Rest Day';
              return (
                <View key={m.id} style={[
                  styles.progressCard,
                  { borderLeftColor: didWorkout ? '#00FF66' : isRestDay ? '#555' : '#FF4500' }
                ]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.progressName}>{m.name}</Text>
                    <View style={styles.progressRow}>
                      <Calendar color="#888" size={13} />
                      <Text style={styles.progressWorkout}>
                        {m.todayWorkoutType || 'No workout scheduled'}
                      </Text>
                    </View>
                    {didWorkout ? (
                      <View style={styles.progressRow}>
                        <Flame color="#00FF66" size={13} />
                        <Text style={styles.progressCalories}>{m.todayCalories ?? 0} kcal burned</Text>
                      </View>
                    ) : isRestDay ? (
                      <Text style={styles.progressMissed}>Rest day — no session needed 🧘</Text>
                    ) : (
                      <Text style={styles.progressMissed}>Hasn't logged a session today yet.</Text>
                    )}
                  </View>
                  <View style={[
                    styles.progressBadge,
                    { backgroundColor: didWorkout ? '#00FF6620' : isRestDay ? '#55555520' : '#FF450020' }
                  ]}>
                    <Text style={[
                      styles.progressBadgeText,
                      { color: didWorkout ? '#00FF66' : isRestDay ? '#888' : '#FF4500' }
                    ]}>
                      {didWorkout ? '✓ Done' : isRestDay ? 'Rest' : 'Absent'}
                    </Text>
                  </View>
                </View>
              );
            })
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
  heroCard: { backgroundColor: '#1E1E1E', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333', minHeight: 120 },
  heroContent: { flex: 1 },
  heroDay: { color: '#00FF66', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  heroExercises: { color: '#A0A0A0', fontSize: 14, lineHeight: 22 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeText: { color: '#888', fontSize: 12, fontWeight: '700' },

  weeklyStrip: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 24 },
  dayPill: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  todayPill: { borderColor: '#00FF6660' },
  activeDayPill: { backgroundColor: '#00FF66', borderColor: '#00FF66' },
  dayPillText: { color: '#888', fontSize: 12, fontWeight: '700' },
  activeDayPillText: { color: '#000' },

  logSection: { marginTop: 8 },
  logCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#333' },
  inputGroup: { marginBottom: 20 },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  inputLabel: { color: '#A0A0A0', fontSize: 14, fontWeight: '600' },
  numericInput: { backgroundColor: '#121212', color: '#fff', padding: 14, borderRadius: 14, fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: '#333' },
  intensityRow: { flexDirection: 'row', gap: 10 },
  intensityPill: { flex: 1, backgroundColor: '#121212', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  activeIntensityPill: { backgroundColor: '#00FF6620', borderColor: '#00FF66' },
  intensityText: { color: '#888', fontSize: 13, fontWeight: '600' },
  activeIntensityText: { color: '#00FF66' },
  calculateButton: { backgroundColor: '#00FF66', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  calculateButtonText: { color: '#000', fontSize: 16, fontWeight: '800' },

  resultCard: { backgroundColor: '#00FF6610', padding: 20, borderRadius: 24, borderLeftWidth: 4, borderLeftColor: '#00FF66', marginBottom: 24 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  resultTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultBody: { color: '#A0A0A0', fontSize: 14, lineHeight: 22 },
  resultHighlight: { color: '#00FF66', fontWeight: '800', fontSize: 18 },

  restDayNotice: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', alignItems: 'center' },
  restDayText: { color: '#666', fontSize: 14, fontStyle: 'italic', textAlign: 'center' },

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
  userGoal: { color: '#00FF66', fontSize: 13, marginTop: 4, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 8 },
  circleButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  progressCard: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#555' },
  progressName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  progressWorkout: { color: '#A0A0A0', fontSize: 13 },
  progressCalories: { color: '#00FF66', fontSize: 13, fontWeight: '600' },
  progressMissed: { color: '#FF4500', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  progressBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginLeft: 12 },
  progressBadgeText: { fontSize: 12, fontWeight: '700' },
});
