
-- Create affiliate payouts table
CREATE TABLE public.affiliate_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount integer NOT NULL, -- in cents
  note text,
  paid_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Admins can manage payouts
CREATE POLICY "Admins can manage payouts"
  ON public.affiliate_payouts FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Affiliates can view their own payout records
CREATE POLICY "Users can view own payouts"
  ON public.affiliate_payouts FOR SELECT
  USING (auth.uid() = user_id);
