import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { UserProfile } from './useAuthStore';

interface MembersState {
  members: UserProfile[];
  loading: boolean;
  fetchMembers: () => Promise<void>;
}

export const useMembersStore = create<MembersState>((set) => ({
  members: [],
  loading: false,
  fetchMembers: async () => {
    set({ loading: true });
    try {
      // 1. Fetch all approved profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved');

      if (profileError) throw profileError;

      // 2. Fetch distinct user_ids from weekly_schedules to see who has a plan
      const { data: schedules, error: scheduleError } = await supabase
        .from('weekly_schedules')
        .select('user_id');

      if (scheduleError) throw scheduleError;

      const scheduledIds = new Set(schedules.map(s => s.user_id));

      const processedMembers = (profiles || []).map(p => ({
        ...p,
        hasSchedule: scheduledIds.has(p.id)
      }));

      set({ members: processedMembers });
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
