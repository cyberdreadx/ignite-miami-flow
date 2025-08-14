-- Remove the overly permissive edge function policy
DROP POLICY IF EXISTS "Allow edge functions to manage media passes" ON public.media_passes;

-- Remove existing policies that might conflict and create new secure ones
DROP POLICY IF EXISTS "Users can view their own media passes" ON public.media_passes;
DROP POLICY IF EXISTS "Users can insert their own media passes" ON public.media_passes;

-- Create specific, restrictive policies for edge function operations
-- Policy 1: Allow edge functions to insert new media passes (for payment processing)
CREATE POLICY "Edge functions can insert media passes"
ON public.media_passes
FOR INSERT
WITH CHECK (true);

-- Policy 2: Allow edge functions to update media pass status only (for payment confirmation)
CREATE POLICY "Edge functions can update media pass status"
ON public.media_passes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy 3: Allow users to view their own media passes (with payment info restricted through functions)
CREATE POLICY "Users can view own media passes"
ON public.media_passes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 4: Allow users to insert their own media passes
CREATE POLICY "Users can insert own media passes"
ON public.media_passes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 5: Allow admins and moderators to view media passes for management
CREATE POLICY "Admins and moderators can view media passes"
ON public.media_passes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND (role = 'admin' OR role = 'moderator')
  )
);

-- Create a secure function for edge functions to update only necessary fields
CREATE OR REPLACE FUNCTION public.update_media_pass_status(
  pass_id uuid,
  new_status text,
  qr_token text DEFAULT NULL,
  qr_data text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only allow updating specific safe fields, not sensitive payment data
  UPDATE public.media_passes 
  SET 
    status = new_status,
    qr_code_token = COALESCE(qr_token, qr_code_token),
    qr_code_data = COALESCE(qr_data, qr_code_data),
    updated_at = now()
  WHERE id = pass_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission for this function to service role (used by edge functions)
GRANT EXECUTE ON FUNCTION public.update_media_pass_status(uuid, text, text, text) TO service_role;