-- Create generate_qr_token function needed by verify-and-create-ticket edge function
CREATE OR REPLACE FUNCTION public.generate_qr_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  token text := '';
  i int;
BEGIN
  FOR i IN 1..32 LOOP
    token := token || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN token;
END;
$$;

-- Create get_my_media_passes function to avoid breaking MyTickets page
CREATE OR REPLACE FUNCTION public.get_my_media_passes()
RETURNS TABLE(
  id uuid,
  pass_type text,
  photographer_name text,
  instagram_handle text,
  status text,
  valid_until text,
  created_at timestamp with time zone,
  qr_code_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Returns empty result set with correct shape (media passes feature not yet implemented)
  RETURN;
END;
$$;