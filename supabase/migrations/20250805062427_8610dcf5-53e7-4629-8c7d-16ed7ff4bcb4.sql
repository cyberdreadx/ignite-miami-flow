-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.process_account_deletion(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user_id UUID;
  current_user_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can process account deletions';
  END IF;
  
  -- Get the user_id from the approved request
  SELECT user_id INTO target_user_id
  FROM public.account_deletion_requests
  WHERE id = request_id AND status = 'approved';
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Deletion request not found or not approved';
  END IF;
  
  -- Delete related data (cascading will handle most)
  -- Note: Supabase auth.users deletion will cascade to profiles automatically
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Update the request status to processed
  UPDATE public.account_deletion_requests 
  SET status = 'processed', updated_at = now()
  WHERE id = request_id;
  
  RETURN TRUE;
END;
$$;