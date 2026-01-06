-- Add onboarding qualification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS buying_for TEXT, -- 'self', 'parent', 'spouse', 'patient', 'other'
ADD COLUMN IF NOT EXISTS age_range TEXT, -- '18-40', '40-60', '60-75', '75+'
ADD COLUMN IF NOT EXISTS gender TEXT, -- 'male', 'female', 'other'
ADD COLUMN IF NOT EXISTS incontinence_level TEXT, -- 'light', 'moderate', 'heavy', 'very_heavy'
ADD COLUMN IF NOT EXISTS mobility_level TEXT, -- 'mobile', 'reduced', 'bedridden'
ADD COLUMN IF NOT EXISTS usage_time TEXT, -- 'day', 'night', 'day_night'
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT false;