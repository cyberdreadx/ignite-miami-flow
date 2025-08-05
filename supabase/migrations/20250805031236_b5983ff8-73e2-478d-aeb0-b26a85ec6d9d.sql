-- Add approval status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'approved';

-- Add check constraint for valid approval statuses
ALTER TABLE public.profiles 
ADD CONSTRAINT check_approval_status 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update default approval status for new users based on their role
-- Members are auto-approved, others need approval
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'member') = 'member' THEN 'approved'
      ELSE 'pending'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT approval_status = 'approved' 
  FROM public.profiles 
  WHERE profiles.user_id = is_user_approved.user_id;
$$;

-- Create function for admins to approve/reject users
CREATE OR REPLACE FUNCTION public.update_user_approval(target_user_id uuid, new_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update approval status';
  END IF;
  
  -- Validate new status
  IF new_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid approval status';
  END IF;
  
  -- Update the approval status
  UPDATE public.profiles 
  SET approval_status = new_status,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;