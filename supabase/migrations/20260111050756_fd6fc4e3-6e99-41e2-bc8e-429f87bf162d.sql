-- Add whatsapp_link column to special_events table for event-specific WhatsApp join links
ALTER TABLE public.special_events
ADD COLUMN whatsapp_link TEXT DEFAULT NULL;