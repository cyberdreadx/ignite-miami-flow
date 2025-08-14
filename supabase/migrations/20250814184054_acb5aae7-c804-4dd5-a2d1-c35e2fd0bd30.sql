-- First, let's see what RLS policies exist on media_passes and remove any that are too permissive
-- The media pass table should only be accessible to:
-- 1. The owner of the media pass
-- 2. Admins and moderators for verification
-- 3. Secure verification functions for QR validation (already implemented)

-- Create a secure function for users to view their own media passes (no sensitive payment data)
CREATE OR REPLACE FUNCTION public.get_my_media_passes()
RETURNS TABLE(
  id uuid,
  pass_type text,
  photographer_name text,
  instagram_handle text,
  status text,
  valid_until timestamp with time zone,
  created_at timestamp with time zone,
  qr_code_token text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    mp.id,
    mp.pass_type,
    mp.photographer_name,
    mp.instagram_handle,
    mp.status,
    mp.valid_until,
    mp.created_at,
    mp.qr_code_token
  FROM public.media_passes mp
  WHERE mp.user_id = auth.uid()
  ORDER BY mp.created_at DESC;
$$;

-- Create a secure function for admins/moderators to view media passes for management
CREATE OR REPLACE FUNCTION public.get_all_media_passes_admin()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  pass_type text,
  photographer_name text,
  instagram_handle text,
  amount integer,
  status text,
  valid_until timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  stripe_session_id text,
  qr_code_token text,
  user_name text,
  user_email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    mp.id,
    mp.user_id,
    mp.pass_type,
    mp.photographer_name,
    mp.instagram_handle,
    mp.amount,
    mp.status,
    mp.valid_until,
    mp.created_at,
    mp.updated_at,
    mp.stripe_session_id,
    mp.qr_code_token,
    p.full_name as user_name,
    p.email as user_email
  FROM public.media_passes mp
  LEFT JOIN public.profiles p ON mp.user_id = p.user_id
  WHERE EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.user_id = auth.uid() 
      AND (admin_profile.role = 'admin' OR admin_profile.role = 'moderator')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND (ur.role = 'admin' OR ur.role = 'moderator')
  )
  ORDER BY mp.created_at DESC;
$$;

-- Grant execute permissions on these functions
GRANT EXECUTE ON FUNCTION public.get_my_media_passes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_media_passes_admin() TO authenticated;