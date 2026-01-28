-- Drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_profile_type_check;

-- Add updated constraint that includes lay_speaker
ALTER TABLE public.profiles ADD CONSTRAINT profiles_profile_type_check 
CHECK (profile_type = ANY (ARRAY['monk'::text, 'lay_speaker'::text, 'contributor'::text]));