-- Add is_active column to programs table if it doesn't exist
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create admin_permissions table for granular permission control
CREATE TABLE public.admin_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Programs permissions
    programs_view boolean NOT NULL DEFAULT false,
    programs_add boolean NOT NULL DEFAULT false,
    programs_edit boolean NOT NULL DEFAULT false,
    programs_delete boolean NOT NULL DEFAULT false,
    -- Schedule permissions
    schedule_view boolean NOT NULL DEFAULT false,
    schedule_add boolean NOT NULL DEFAULT false,
    schedule_edit boolean NOT NULL DEFAULT false,
    schedule_delete boolean NOT NULL DEFAULT false,
    -- Dharma Requests permissions
    requests_view boolean NOT NULL DEFAULT false,
    requests_approve boolean NOT NULL DEFAULT false,
    requests_reject boolean NOT NULL DEFAULT false,
    requests_delete boolean NOT NULL DEFAULT false,
    -- Events permissions
    events_view boolean NOT NULL DEFAULT false,
    events_manage boolean NOT NULL DEFAULT false,
    -- Admin Users permissions (Super Admin only)
    admin_users_manage boolean NOT NULL DEFAULT false,
    -- Preachers permissions
    preachers_view boolean NOT NULL DEFAULT false,
    preachers_add boolean NOT NULL DEFAULT false,
    preachers_edit boolean NOT NULL DEFAULT false,
    preachers_delete boolean NOT NULL DEFAULT false,
    -- Metadata
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS on admin_permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all permissions
CREATE POLICY "Super admins can manage all permissions"
ON public.admin_permissions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role) AND 
       EXISTS (SELECT 1 FROM public.admin_permissions WHERE user_id = auth.uid() AND admin_users_manage = true))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND 
            EXISTS (SELECT 1 FROM public.admin_permissions WHERE user_id = auth.uid() AND admin_users_manage = true));

-- Admins can view their own permissions
CREATE POLICY "Admins can view own permissions"
ON public.admin_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_permissions_updated_at
    BEFORE UPDATE ON public.admin_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create a function to check specific permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result boolean;
BEGIN
    -- First check if user is admin
    IF NOT public.has_role(_user_id, 'admin'::app_role) THEN
        RETURN false;
    END IF;
    
    -- Then check specific permission
    EXECUTE format('SELECT %I FROM public.admin_permissions WHERE user_id = $1', _permission)
    INTO result
    USING _user_id;
    
    RETURN COALESCE(result, false);
END;
$$;

-- Add RLS policy for programs to allow admin management
CREATE POLICY "Admins can manage programs"
ON public.programs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));