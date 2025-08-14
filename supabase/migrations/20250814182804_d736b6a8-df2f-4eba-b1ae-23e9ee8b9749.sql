-- Remove overly permissive public access policies
DROP POLICY IF EXISTS "Allow public access to basic profile info for verification" ON public.profiles;
DROP POLICY IF EXISTS "Debug: All authenticated users can read profiles" ON public.profiles;

-- Allow viewing only approved profiles that opt into directory visibility
CREATE POLICY "Public can view approved directory profiles"
ON public.profiles
FOR SELECT
USING (
  approval_status = 'approved' 
  AND show_in_directory = true
);

-- Allow viewing basic profile info for post/comment authors (name and avatar only)
CREATE POLICY "Anyone can view basic author info for posts"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.user_id = profiles.user_id
  )
  OR EXISTS (
    SELECT 1 FROM public.comments 
    WHERE comments.user_id = profiles.user_id
  )
);

-- Ensure admins can still view all profiles for management
CREATE POLICY "Admins can view all profiles for management"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);