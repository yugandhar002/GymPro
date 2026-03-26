-- 1. Weekly Schedules Table
CREATE TABLE IF NOT EXISTS public.weekly_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    workout_type text NOT NULL,
    exercises text, -- comma separated
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, day_of_week)
);

-- 2. Workout Logs Table
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    workout_type text NOT NULL,
    duration_minutes integer,
    intensity text, -- light, moderate, intense
    calories_burned integer,
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, date)
);

-- 3. Disable RLS for MVP development (matching profiles pattern)
ALTER TABLE public.weekly_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;
