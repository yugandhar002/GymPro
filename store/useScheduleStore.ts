import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface WeeklySchedule {
  id: string;
  user_id: string;
  day_of_week: number; // 0=Monday to 6=Sunday
  workout_type: string;
  exercises: string;
  created_at?: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  date: string;
  workout_type: string;
  duration_minutes?: number;
  intensity?: string;
  calories_burned?: number;
  completed: boolean;
}

interface ScheduleState {
  userSchedules: Record<string, WeeklySchedule[]>;
  todayLog: WorkoutLog | null;
  loading: boolean;
  fetchUserSchedules: (userId: string) => Promise<void>;
  fetchTodayLog: (userId: string) => Promise<void>;
  upsertSchedule: (userId: string, day: number, type: string, exercises: string) => Promise<void>;
  saveWorkoutLog: (log: Omit<WorkoutLog, 'id'>) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  userSchedules: {},
  todayLog: null,
  loading: false,

  fetchUserSchedules: async (userId: string) => {
    // ... (logic remains same)
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('weekly_schedules')
        .select('*')
        .eq('user_id', userId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      set((state) => ({ userSchedules: { ...state.userSchedules, [userId]: data || [] } }));
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  fetchTodayLog: async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (data && !error) {
      set({ todayLog: data });
    }
  },

  upsertSchedule: async (userId, day, type, exercises) => {
    // ... (logic remains same)
    try {
      const { error } = await supabase
        .from('weekly_schedules')
        .upsert({ user_id: userId, day_of_week: day, workout_type: type, exercises: exercises }, { onConflict: 'user_id,day_of_week' });
      if (error) throw error;
      await get().fetchUserSchedules(userId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  saveWorkoutLog: async (log) => {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .upsert(log, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;
      set({ todayLog: data });
    } catch (error) {
      console.error('Error saving workout log:', error);
      throw error;
    }
  }
}));
