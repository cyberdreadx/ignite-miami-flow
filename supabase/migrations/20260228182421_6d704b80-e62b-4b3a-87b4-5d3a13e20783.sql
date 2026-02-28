-- Drop conflicting policies first
DROP POLICY IF EXISTS "Users can view own earnings" ON public.affiliate_earnings;
DROP POLICY IF EXISTS "Admins can view all earnings" ON public.affiliate_earnings;
DROP POLICY IF EXISTS "Service role can insert earnings" ON public.affiliate_earnings;
DROP POLICY IF EXISTS "Service role can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Admins can view all referrals" ON public.referrals;

-- Recreate earnings policies
CREATE POLICY "Users can view own earnings"
  ON public.affiliate_earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_codes ac
      WHERE ac.id = affiliate_earnings.affiliate_code_id
        AND ac.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all earnings"
  ON public.affiliate_earnings FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Service role can insert earnings"
  ON public.affiliate_earnings FOR INSERT
  WITH CHECK (true);

-- Referrals policies
CREATE POLICY "Service role can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all referrals"
  ON public.referrals FOR SELECT
  USING (is_admin(auth.uid()));
