-- Create program_schedule table for daily/weekly schedules
CREATE TABLE public.program_schedule (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    program_name_sinhala TEXT NOT NULL,
    program_name_english TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create special_events table
CREATE TABLE public.special_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title_sinhala TEXT NOT NULL,
    title_english TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.program_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for program_schedule
CREATE POLICY "Anyone can view active schedules"
ON public.program_schedule
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage schedules"
ON public.program_schedule
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for special_events
CREATE POLICY "Anyone can view active events"
ON public.special_events
FOR SELECT
USING (is_active = true AND end_datetime > now());

CREATE POLICY "Admins can manage events"
ON public.special_events
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_program_schedule_updated_at
BEFORE UPDATE ON public.program_schedule
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_special_events_updated_at
BEFORE UPDATE ON public.special_events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();