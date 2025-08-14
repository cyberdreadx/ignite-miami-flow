-- Fix Function Search Path Mutable security warnings by setting search_path = '' for all functions

-- Update existing functions to have secure search_path
ALTER FUNCTION public.has_completed_waiver(uuid) SET search_path = '';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.get_user_roles(uuid) SET search_path = '';
ALTER FUNCTION public.update_last_active() SET search_path = '';
ALTER FUNCTION public.toggle_like(uuid) SET search_path = '';
ALTER FUNCTION public.toggle_pin(uuid) SET search_path = '';
ALTER FUNCTION public.create_post(text, text[], text[]) SET search_path = '';
ALTER FUNCTION public.get_posts_with_counts() SET search_path = '';
ALTER FUNCTION public.generate_qr_token() SET search_path = '';
ALTER FUNCTION public.is_user_approved(uuid) SET search_path = '';
ALTER FUNCTION public.update_user_approval(uuid, text) SET search_path = '';
ALTER FUNCTION public.process_account_deletion(uuid) SET search_path = '';
ALTER FUNCTION public.promote_user_to_admin(text) SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.debug_auth_uid() SET search_path = '';

-- Fix any functions that might not have search_path set properly
-- Note: Some functions already have SET search_path = '' but we'll make sure they're all consistent