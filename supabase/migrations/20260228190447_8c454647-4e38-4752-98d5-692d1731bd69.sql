
-- Create process_affiliate_referral function
-- This records an earning for the affiliate when a ticket is purchased using their code
CREATE OR REPLACE FUNCTION public.process_affiliate_referral(
  p_affiliate_code text,
  p_ticket_id uuid,
  p_referred_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id uuid;
  v_code_user_id uuid;
BEGIN
  -- Find the affiliate code
  SELECT id, user_id INTO v_code_id, v_code_user_id
  FROM public.affiliate_codes
  WHERE code = p_affiliate_code AND is_active = true;

  IF v_code_id IS NULL THEN
    RETURN false;
  END IF;

  -- Don't credit if the buyer is the code owner
  IF v_code_user_id = p_referred_user_id THEN
    RETURN false;
  END IF;

  -- Insert earning record ($1 = 100 cents)
  INSERT INTO public.affiliate_earnings (affiliate_code_id, ticket_id, amount)
  VALUES (v_code_id, p_ticket_id, 100)
  ON CONFLICT DO NOTHING;

  -- Insert referral record
  INSERT INTO public.referrals (affiliate_code_id, referrer_id, referred_id)
  VALUES (v_code_id, v_code_user_id, p_referred_user_id)
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_affiliate_referral(text, uuid, uuid) TO service_role;
