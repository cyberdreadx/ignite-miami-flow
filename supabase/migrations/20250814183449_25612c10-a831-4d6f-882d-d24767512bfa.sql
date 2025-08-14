-- Remove the overly permissive public QR verification policy
DROP POLICY IF EXISTS "Allow public verification with QR token" ON public.tickets;

-- Create a secure QR verification function that only returns essential data
CREATE OR REPLACE FUNCTION public.verify_qr_token(token text)
RETURNS TABLE(
  is_valid boolean,
  ticket_status text,
  event_id uuid,
  used_at timestamp with time zone,
  valid_until timestamp with time zone,
  used_by text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    CASE 
      WHEN t.qr_code_token IS NOT NULL AND t.status = 'paid' THEN true
      ELSE false
    END as is_valid,
    t.status as ticket_status,
    t.event_id,
    t.used_at,
    t.valid_until,
    t.used_by
  FROM public.tickets t
  WHERE t.qr_code_token = token
  LIMIT 1;
$$;

-- Create a similar function for media passes
CREATE OR REPLACE FUNCTION public.verify_media_pass_qr(token text)
RETURNS TABLE(
  is_valid boolean,
  pass_status text,
  pass_type text,
  photographer_name text,
  instagram_handle text,
  valid_until timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    CASE 
      WHEN mp.qr_code_token IS NOT NULL AND mp.status = 'paid' THEN true
      ELSE false
    END as is_valid,
    mp.status as pass_status,
    mp.pass_type,
    mp.photographer_name,
    mp.instagram_handle,
    mp.valid_until
  FROM public.media_passes mp
  WHERE mp.qr_code_token = token
  LIMIT 1;
$$;

-- Create a similar function for subscriptions
CREATE OR REPLACE FUNCTION public.verify_subscription_qr(token text)
RETURNS TABLE(
  is_valid boolean,
  subscription_status text,
  current_period_end timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    CASE 
      WHEN s.qr_code_token IS NOT NULL AND s.status = 'active' THEN true
      ELSE false
    END as is_valid,
    s.status as subscription_status,
    s.current_period_end
  FROM public.subscriptions s
  WHERE s.qr_code_token = token
  LIMIT 1;
$$;

-- Remove public QR verification policies from other tables too
DROP POLICY IF EXISTS "Allow public verification with QR token" ON public.media_passes;
DROP POLICY IF EXISTS "Allow public verification with QR token" ON public.subscriptions;

-- Grant execute permissions on the verification functions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.verify_qr_token(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.verify_media_pass_qr(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.verify_subscription_qr(text) TO authenticated, anon;