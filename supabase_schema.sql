-- GymPro Supabase Database Schema

-- 1. Create the custom Profiles table that extends the built-in Auth users
CREATE TABLE public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  email text,
  role text default 'user',
  status text default 'pending',
  dob text,
  age integer,
  address text,
  weight text,
  height text,
  fitness_goal text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn off Row Level Security (RLS) temporarily for easy MVP development
-- (In a true production app, we would enable RLS and write strict policies)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Create a trigger to automatically create a profile placeholder when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
