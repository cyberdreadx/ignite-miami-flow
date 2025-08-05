-- Create table for account deletion requests
CREATE TABLE public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own deletion requests
CREATE POLICY "Users can create deletion requests" 
ON public.account_deletion_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own deletion requests
CREATE POLICY "Users can view their own deletion requests" 
ON public.account_deletion_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all deletion requests
CREATE POLICY "Admins can view all deletion requests" 
ON public.account_deletion_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update deletion requests (for approval/denial)
CREATE POLICY "Admins can update deletion requests" 
ON public.account_deletion_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_account_deletion_requests_updated_at
BEFORE UPDATE ON public.account_deletion_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle approved account deletions
CREATE OR REPLACE FUNCTION public.process_account_deletion(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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