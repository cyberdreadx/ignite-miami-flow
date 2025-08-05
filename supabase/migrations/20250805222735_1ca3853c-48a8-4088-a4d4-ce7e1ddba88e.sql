-- Add privacy and community features to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS instagram_handle text,
ADD COLUMN IF NOT EXISTS show_in_directory boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_contact_info boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_active timestamp with time zone DEFAULT now();

-- Create index for better performance on directory queries
CREATE INDEX IF NOT EXISTS idx_profiles_directory ON public.profiles(show_in_directory, approval_status) WHERE show_in_directory = true AND approval_status = 'approved';

-- Create function to update last_active timestamp
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_active = now() 
  WHERE user_id = auth.uid();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_active on posts/comments (community activity)
DROP TRIGGER IF EXISTS update_last_active_on_post ON public.posts;
CREATE TRIGGER update_last_active_on_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active();

DROP TRIGGER IF EXISTS update_last_active_on_comment ON public.comments;
CREATE TRIGGER update_last_active_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active();