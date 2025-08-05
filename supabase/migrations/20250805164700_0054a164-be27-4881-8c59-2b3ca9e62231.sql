-- First, migrate existing admin roles from profiles to user_roles table
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT user_id, role::app_role, user_id
FROM public.profiles 
WHERE role IN ('admin', 'photographer', 'performer', 'moderator', 'dj', 'vip_member', 'member')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the RLS policy to also check legacy profiles.role for backward compatibility
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);