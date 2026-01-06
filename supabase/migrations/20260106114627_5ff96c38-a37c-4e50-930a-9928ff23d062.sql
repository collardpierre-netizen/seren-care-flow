-- Add preferred_size column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_size TEXT;