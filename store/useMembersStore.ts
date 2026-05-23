import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { UserProfile } from './useAuthStore';

export interface MemberWithProgress extends UserProfile {
  hasSchedule: boolean;
  todayWorkoutType?: string;
  todayCalories?: number;
  todayCompleted?: boolean;
}

interface MembersState {
  members: MemberWithProgress[];
  loading: boolean;
  fetchMembers: () => Promise<void>;
}

export const useMembersStore = create<MembersState>((set) => ({
  members: [],
  loading: false,
  fetchMembers: async () => {
    set({ loading: true });
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayDay = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun

      // 1. Fetch all approved profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved');

      if (profileError) throw profileError;

      const memberIds = (profiles || []).map(p => p.id);
      if (memberIds.length === 0) {
        set({ members: [], loading: false });
        return;
      }

      // 2. Fetch schedules (to check who has a plan set)
      const { data: schedules } = await supabase
        .from('weekly_schedules')
        .select('user_id')
        .in('user_id', memberIds);

      const scheduledIds = new Set((schedules || []).map(s => s.user_id));

      // 3. Fetch today's scheduled workout type for each member
      const { data: todaySchedules } = await supabase
        .from('weekly_schedules')
        .select('user_id, workout_type')
        .in('user_id', memberIds)
        .eq('day_of_week', todayDay);

      const todayScheduleMap: Record<string, string> = {};
      (todaySchedules || []).forEach(s => { todayScheduleMap[s.user_id] = s.workout_type; });

      // 4. Fetch today's workout logs for all members
      const { data: todayLogs } = await supabase
        .from('workout_logs')
        .select('user_id, workout_type, calories_burned, completed')
        .in('user_id', memberIds)
        .eq('date', today);

      const todayLogMap: Record<string, { workout_type: string; calories_burned?: number; completed: boolean }> = {};
      (todayLogs || []).forEach(l => { todayLogMap[l.user_id] = l; });

      // 5. Merge everything
      const processedMembers: MemberWithProgress[] = (profiles || []).map(p => ({
        ...p,
        hasSchedule: scheduledIds.has(p.id),
        todayWorkoutType: todayScheduleMap[p.id],
        todayCalories: todayLogMap[p.id]?.calories_burned,
        todayCompleted: todayLogMap[p.id]?.completed ?? false,
      }));

      set({ members: processedMembers });
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
