-- Add allow_deshana_request column to programs table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS allow_deshana_request boolean NOT NULL DEFAULT true;