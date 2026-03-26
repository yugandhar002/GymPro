import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { differenceInYears, parseISO } from 'date-fns';

export type Role = 'admin' | 'user' | null;
export type UserStatus = 'pending' | 'approved' | 'denied';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  dob?: string;
  age?: number;
  address?: string;
  weight?: string;
  height?: string;
  fitness_goal?: string; 
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  
  initializeAuth: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (password: string, data: Omit<UserProfile, 'id' | 'status' | 'age' | 'role'>) => Promise<void>;

  // Admin Operations
  pendingUsers: UserProfile[];
  fetchPendingUsers: () => Promise<void>;
  approveUser: (id: string) => Promise<void>;
  denyUser: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  pendingUsers: [],

  initializeAuth: async () => {
    // Check if there is an active session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        set({ user: profile, isAuthenticated: true });
        if (profile.role === 'admin') {
          get().fetchPendingUsers();
        }
      }
    }
    
    // Listen for auth changes seamlessly
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Don't duplicate logic if not needed, but ensure we catch sign in / sign out events
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          set({ user: profile, isAuthenticated: true });
          if (profile.role === 'admin') {
            get().fetchPendingUsers();
          }
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false, pendingUsers: [] });
      }
    });
  },

  login: async (email, password = 'password123') => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
       alert(error.message); // Tell the user what went exactly wrong
       throw error;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  register: async (password, data) => {
    const age = data.dob ? differenceInYears(new Date(), parseISO(data.dob)) : null;
    
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: password,
    });

    if (authError) {
      alert(authError.message);
      return;
    }

    if (authData.user) {
      // 2. Retry mechanism: Wait until the database trigger finishes creating the profile placeholder
      let retries = 4;
      let success = false;
      
      while (retries > 0 && !success) {
        await new Promise(resolve => setTimeout(resolve, 800)); // wait 0.8s between checks

        // 3. Update the profile row with the rich user details
        const { data: updatedRows, error: profileError } = await supabase
          .from('profiles')
          .update({
            name: data.name,
            dob: data.dob,
            age: age,
            address: data.address,
            weight: data.weight,
            height: data.height,
            fitness_goal: data.fitness_goal, 
          })
          .eq('id', authData.user.id)
          .select(); // Ask Supabase to return the row if successful
          
        if (profileError) {
           alert("Profile update error: " + profileError.message);
           return;
        } else if (!updatedRows || updatedRows.length === 0) {
           retries--; // The SQL trigger hasn't fired yet
        } else {
           success = true;
        }
      }

      if (!success) {
         alert("Database Error: We created your account, but we couldn't save your details (height, weight). You may need to run the SQL command to disable RLS again.");
      }
    }
  },

  fetchPendingUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'pending');
      
    if (data && !error) {
       set({ pendingUsers: data });
    }
  },

  approveUser: async (id) => {
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', id);
    get().fetchPendingUsers(); // Refetch list automatically
  },

  denyUser: async (id) => {
    await supabase.from('profiles').update({ status: 'denied' }).eq('id', id);
    get().fetchPendingUsers();
  }
}));
