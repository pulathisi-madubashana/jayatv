-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy: Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create dharma_requests table
CREATE TABLE public.dharma_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
    program_name_sinhala text NOT NULL,
    program_name_english text NOT NULL,
    preacher_ids uuid[] DEFAULT '{}',
    preacher_names_sinhala text[] DEFAULT '{}',
    preacher_names_english text[] DEFAULT '{}',
    requested_date date NOT NULL,
    requester_name text NOT NULL,
    phone_country_code text NOT NULL,
    phone_number text NOT NULL,
    whatsapp_country_code text NOT NULL,
    whatsapp_number text NOT NULL,
    message text,
    language_used text DEFAULT 'en',
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on dharma_requests
ALTER TABLE public.dharma_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert requests (public form submission)
CREATE POLICY "Anyone can submit dharma requests"
ON public.dharma_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.dharma_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update requests
CREATE POLICY "Admins can update requests"
ON public.dharma_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete requests
CREATE POLICY "Admins can delete requests"
ON public.dharma_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_dharma_requests_updated_at
BEFORE UPDATE ON public.dharma_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create program_preachers junction table for multi-preacher support
CREATE TABLE public.program_preachers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (program_id, profile_id)
);

-- Enable RLS on program_preachers
ALTER TABLE public.program_preachers ENABLE ROW LEVEL SECURITY;

-- Anyone can view program-preacher relationships
CREATE POLICY "Anyone can view program preachers"
ON public.program_preachers
FOR SELECT
USING (true);

-- Only admins can manage program-preacher relationships
CREATE POLICY "Admins can manage program preachers"
ON public.program_preachers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));