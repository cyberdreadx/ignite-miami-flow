
-- Add tier column to affiliate_codes: 'standard' ($1) or 'promoter' ($3)
ALTER TABLE public.affiliate_codes 
ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'standard' 
CHECK (tier IN ('standard', 'promoter'));

-- Update process_affiliate_referral to pay based on tier
CREATE OR REPLACE FUNCTION public.process_affiliate_referral(p_affiliate_code text, p_ticket_id uuid, p_referred_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code_id uuid;
  v_code_user_id uuid;
  v_tier text;
  v_amount integer;
BEGIN
  -- Find the affiliate code and its tier
  SELECT id, user_id, tier INTO v_code_id, v_code_user_id, v_tier
  FROM public.affiliate_codes
  WHERE code = p_affiliate_code AND is_active = true;

  IF v_code_id IS NULL THEN
    RETURN false;
  END IF;

  -- Don't credit if the buyer is the code owner
  IF v_code_user_id = p_referred_user_id THEN
    RETURN false;
  END IF;

  -- Determine payout amount based on tier
  v_amount := CASE WHEN v_tier = 'promoter' THEN 300 ELSE 100 END;

  -- Insert earning record
  INSERT INTO public.affiliate_earnings (affiliate_code_id, ticket_id, amount)
  VALUES (v_code_id, p_ticket_id, v_amount)
  ON CONFLICT DO NOTHING;

  -- Insert referral record
  INSERT INTO public.referrals (affiliate_code_id, referrer_id, referred_id)
  VALUES (v_code_id, v_code_user_id, p_referred_user_id)
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$function$;
