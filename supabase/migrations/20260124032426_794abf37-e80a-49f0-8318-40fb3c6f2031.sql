-- Add address fields to dharma_requests table for Gamin Gamata Sadaham program
ALTER TABLE public.dharma_requests 
ADD COLUMN IF NOT EXISTS location_name text,
ADD COLUMN IF NOT EXISTS address_line_1 text,
ADD COLUMN IF NOT EXISTS address_line_2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS province text,
ADD COLUMN IF NOT EXISTS location_contact_phone text;