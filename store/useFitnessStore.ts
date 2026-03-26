import { create } from 'zustand';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export type WorkoutType = 'Home' | 'Gym' | 'Yoga' | 'Cardio';

export interface Workout {
  id: string;
  title: string;
  type: WorkoutType;
  videoUrl?: string; // YouTube URL
  instructions: string;
}

export interface ActivityLog {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  calories: number;
}

export interface Schedule {
  id: string;
  userId: string;
  workoutId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

interface FitnessState {
  workouts: Workout[];
  activityLogs: ActivityLog[];
  schedules: Schedule[];
  
  // Admin Actions
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  assignSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  
  // User Actions
  logActivity: (date: string, steps: number, calories: number) => void;
  markWorkoutComplete: (scheduleId: string) => void;
}

// Initial mock data
const INITIAL_WORKOUTS: Workout[] = [
  { id: 'w_1', title: 'Full Body HIIT', type: 'Cardio', videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI', instructions: '30s on, 15s off. Jumping jacks, burpees, high knees.' },
  { id: 'w_2', title: 'Leg Day Essentials', type: 'Gym', videoUrl: 'https://www.youtube.com/watch?v=X0qC1N0Iy20', instructions: 'Squats 3x10, Lunges 3x15, Leg Press 3x12.' },
];

export const useFitnessStore = create<FitnessState>((set) => ({
  workouts: INITIAL_WORKOUTS,
  activityLogs: [],
  schedules: [],
  
  addWorkout: (w) => set((state) => ({
    workouts: [...state.workouts, { ...w, id: uuidv4() }]
  })),
  
  assignSchedule: (s) => set((state) => ({
    schedules: [...state.schedules, { ...s, id: uuidv4() }]
  })),
  
  logActivity: (date, steps, calories) => set((state) => {
    const existingIndex = state.activityLogs.findIndex(log => log.date === date);
    if (existingIndex >= 0) {
      const newLogs = [...state.activityLogs];
      newLogs[existingIndex] = { ...newLogs[existingIndex], steps, calories };
      return { activityLogs: newLogs };
    }
    return { activityLogs: [...state.activityLogs, { id: uuidv4(), date, steps, calories }] };
  }),
  
  markWorkoutComplete: (scheduleId) => set((state) => ({
    schedules: state.schedules.map(s => s.id === scheduleId ? { ...s, completed: true } : s)
  }))
}));
