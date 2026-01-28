-- Add database-level input validation constraints for dharma_requests
-- This adds server-side validation as a security measure

-- Add length constraints for text fields using triggers (safer than CHECK constraints)
CREATE OR REPLACE FUNCTION public.validate_dharma_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate requester_name length (max 100 characters)
  IF length(NEW.requester_name) > 100 THEN
    RAISE EXCEPTION 'Requester name must be 100 characters or less';
  END IF;
  
  -- Validate message length (max 1000 characters)
  IF NEW.message IS NOT NULL AND length(NEW.message) > 1000 THEN
    RAISE EXCEPTION 'Message must be 1000 characters or less';
  END IF;
  
  -- Validate phone_number format (only digits, max 15 chars per E.164)
  IF NEW.phone_number !~ '^[0-9]{1,15}$' THEN
    RAISE EXCEPTION 'Phone number must contain only digits (1-15 characters)';
  END IF;
  
  -- Validate whatsapp_number format (only digits or empty, max 15 chars)
  IF NEW.whatsapp_number IS NOT NULL AND NEW.whatsapp_number != '' 
     AND NEW.whatsapp_number !~ '^[0-9]{1,15}$' THEN
    RAISE EXCEPTION 'WhatsApp number must contain only digits (1-15 characters)';
  END IF;
  
  -- Validate country code format (+1 to +999)
  IF NEW.phone_country_code !~ '^\+[0-9]{1,4}$' THEN
    RAISE EXCEPTION 'Invalid phone country code format';
  END IF;
  
  IF NEW.whatsapp_country_code !~ '^\+[0-9]{1,4}$' THEN
    RAISE EXCEPTION 'Invalid WhatsApp country code format';
  END IF;
  
  -- Validate program names length
  IF length(NEW.program_name_english) > 200 THEN
    RAISE EXCEPTION 'Program name (English) must be 200 characters or less';
  END IF;
  
  IF length(NEW.program_name_sinhala) > 200 THEN
    RAISE EXCEPTION 'Program name (Sinhala) must be 200 characters or less';
  END IF;
  
  -- Validate admin_note length (max 500 characters)
  IF NEW.admin_note IS NOT NULL AND length(NEW.admin_note) > 500 THEN
    RAISE EXCEPTION 'Admin note must be 500 characters or less';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS validate_dharma_request_insert ON public.dharma_requests;
CREATE TRIGGER validate_dharma_request_insert
  BEFORE INSERT ON public.dharma_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_dharma_request();

-- Create trigger for UPDATE operations  
DROP TRIGGER IF EXISTS validate_dharma_request_update ON public.dharma_requests;
CREATE TRIGGER validate_dharma_request_update
  BEFORE UPDATE ON public.dharma_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_dharma_request();