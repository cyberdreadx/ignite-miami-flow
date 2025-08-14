-- Remove the current public policies that still expose too much data
DROP POLICY IF EXISTS "Public can view approved directory profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view basic author info for posts" ON public.profiles;

-- Create a secure function for directory listings that only shows safe public info
CREATE OR REPLACE FUNCTION public.get_directory_profiles()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  role text,
  last_active timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.role,
    p.last_active,
    p.created_at
  FROM public.profiles p
  WHERE p.approval_status = 'approved' 
    AND p.show_in_directory = true
  ORDER BY p.last_active DESC NULLS LAST;
$$;

-- Create a secure function for post/comment author info that only shows essential data
CREATE OR REPLACE FUNCTION public.get_author_info(author_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.role
  FROM public.profiles p
  WHERE p.user_id = author_user_id
    AND (
      EXISTS (
        SELECT 1 FROM public.posts 
        WHERE posts.user_id = author_user_id
      )
      OR EXISTS (
        SELECT 1 FROM public.comments 
        WHERE comments.user_id = author_user_id
      )
    )
  LIMIT 1;
$$;

-- Create a function for admin management that returns full profile data
CREATE OR REPLACE FUNCTION public.get_all_profiles_admin()
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  instagram_handle text,
  role text,
  approval_status text,
  show_in_directory boolean,
  show_contact_info boolean,
  last_active timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.user_id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.instagram_handle,
    p.role,
    p.approval_status,
    p.show_in_directory,
    p.show_contact_info,
    p.last_active,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.role = 'admin'
  )
  ORDER BY p.created_at DESC;
$$;

-- Grant execute permissions on these functions
GRANT EXECUTE ON FUNCTION public.get_directory_profiles() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_author_info(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_admin() TO authenticated;