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

interface ScheduleState {
  userSchedules: Record<string, WeeklySchedule[]>; // user_id -> schedules
  loading: boolean;
  fetchUserSchedules: (userId: string) => Promise<void>;
  upsertSchedule: (userId: string, day: number, type: string, exercises: string) => Promise<void>;
  logWorkout: (userId: string, type: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  userSchedules: {},
  loading: false,

  fetchUserSchedules: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('weekly_schedules')
        .select('*')
        .eq('user_id', userId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      
      set((state) => ({
        userSchedules: {
          ...state.userSchedules,
          [userId]: data || []
        }
      }));
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      set({ loading: false });
    }
  },

  upsertSchedule: async (userId, day, type, exercises) => {
    try {
      const { error } = await supabase
        .from('weekly_schedules')
        .upsert({
          user_id: userId,
          day_of_week: day,
          workout_type: type,
          exercises: exercises,
        }, { onConflict: 'user_id,day_of_week' });

      if (error) throw error;
      
      // Refresh local cache
      await get().fetchUserSchedules(userId);
    } catch (error) {
      console.error('Error upserting schedule:', error);
      throw error;
    }
  },

  logWorkout: async (userId, type) => {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: userId,
          workout_type: type,
          completed: false,
          date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging workout:', error);
      throw error;
    }
  }
}));
