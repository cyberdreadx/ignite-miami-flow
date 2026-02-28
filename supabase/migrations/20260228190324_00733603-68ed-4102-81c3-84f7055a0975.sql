
-- Fix overly permissive INSERT policies - scope to service role using current_setting check
-- Drop the overly permissive ones
DROP POLICY IF EXISTS "Service role can insert earnings" ON public.affiliate_earnings;
DROP POLICY IF EXISTS "Service role can insert referrals" ON public.referrals;

-- Re-create with proper service-role check
CREATE POLICY "Service role can insert earnings"
  ON public.affiliate_earnings FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
    OR is_admin(auth.uid())
  );

CREATE POLICY "Service role can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
    OR is_admin(auth.uid())
  );
