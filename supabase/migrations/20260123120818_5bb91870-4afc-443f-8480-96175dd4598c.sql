-- Add new conditional fields for dharma_requests table
-- These fields support program-specific request information

-- For "Gamin Gamata Sadaham" program - recording details
ALTER TABLE public.dharma_requests ADD COLUMN IF NOT EXISTS recording_date date;
ALTER TABLE public.dharma_requests ADD COLUMN IF NOT EXISTS recording_time time without time zone;
ALTER TABLE public.dharma_requests ADD COLUMN IF NOT EXISTS recording_location_type text;
ALTER TABLE public.dharma_requests ADD COLUMN IF NOT EXISTS recording_location_other text;

-- For other dharma deshana programs - branch/location details
ALTER TABLE public.dharma_requests ADD COLUMN IF NOT EXISTS branch_location text;
ALTER TABLE public.dharma_requests ADD COLUMN IF NOT EXISTS branch_location_other text;

-- Add request_type to distinguish between recording-based and branch-based requests
ALTER TABLE public.dharma_requests ADD COLUMN IF NOT EXISTS request_type text DEFAULT 'standard';

-- Add constraint for recording_location_type values
ALTER TABLE public.dharma_requests ADD CONSTRAINT dharma_requests_recording_location_type_check 
CHECK (recording_location_type IS NULL OR recording_location_type = ANY (ARRAY['home'::text, 'temple'::text, 'public_place'::text, 'office'::text, 'other'::text]));

-- Add constraint for branch_location values
ALTER TABLE public.dharma_requests ADD CONSTRAINT dharma_requests_branch_location_check 
CHECK (branch_location IS NULL OR branch_location = ANY (ARRAY['colombo'::text, 'senkadagala'::text, 'other'::text]));

-- Add constraint for request_type values
ALTER TABLE public.dharma_requests ADD CONSTRAINT dharma_requests_request_type_check 
CHECK (request_type = ANY (ARRAY['recording'::text, 'branch'::text, 'standard'::text]));