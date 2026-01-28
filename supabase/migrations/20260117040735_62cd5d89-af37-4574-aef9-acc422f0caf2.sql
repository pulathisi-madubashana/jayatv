-- Add category column to programs table for categorizing programs
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Discussion';

-- Add a comment to explain the category column
COMMENT ON COLUMN public.programs.category IS 'Program category: Discussion, Meditation, Motivational, Educational, Outreach, Reflection, Sermons, etc.';
