-- Create affiliate system tables

-- Table for storing affiliate codes
CREATE TABLE public.affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_uses INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0, -- in cents
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking individual referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code_id UUID NOT NULL REFERENCES public.affiliate_codes(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  discount_amount INTEGER NOT NULL, -- in cents, how much discount was applied
  affiliate_earning INTEGER NOT NULL, -- in cents, how much affiliate earned
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking affiliate earnings summary
CREATE TABLE public.affiliate_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_earned INTEGER DEFAULT 0, -- in cents
  total_referrals INTEGER DEFAULT 0,
  last_payout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add affiliate code tracking to tickets table
ALTER TABLE public.tickets 
ADD COLUMN affiliate_code_used TEXT,
ADD COLUMN discount_applied INTEGER DEFAULT 0, -- in cents
ADD COLUMN original_amount INTEGER; -- original price before discount

-- Enable RLS on new tables
ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_codes
CREATE POLICY "Users can view their own affiliate codes" 
ON public.affiliate_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate codes" 
ON public.affiliate_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate codes" 
ON public.affiliate_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliate codes" 
ON public.affiliate_codes 
FOR SELECT 
USING (
  public.get_current_user_role_from_profiles() IN ('admin', 'moderator')
  OR public.current_user_has_admin_or_moderator_role()
);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals for their affiliate codes" 
ON public.referrals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.affiliate_codes 
    WHERE affiliate_codes.id = referrals.affiliate_code_id 
    AND affiliate_codes.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all referrals" 
ON public.referrals 
FOR SELECT 
USING (
  public.get_current_user_role_from_profiles() IN ('admin', 'moderator')
  OR public.current_user_has_admin_or_moderator_role()
);

-- RLS Policies for affiliate_earnings
CREATE POLICY "Users can view their own earnings" 
ON public.affiliate_earnings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own earnings" 
ON public.affiliate_earnings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own earnings" 
ON public.affiliate_earnings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can update earnings" 
ON public.affiliate_earnings 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can view all earnings" 
ON public.affiliate_earnings 
FOR SELECT 
USING (
  public.get_current_user_role_from_profiles() IN ('admin', 'moderator')
  OR public.current_user_has_admin_or_moderator_role()
);

-- Create function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    new_code := UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.affiliate_codes WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create function to apply affiliate discount and track referral
CREATE OR REPLACE FUNCTION public.process_affiliate_referral(
  p_affiliate_code TEXT,
  p_ticket_id UUID,
  p_referred_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  affiliate_code_record RECORD;
  discount_amount INTEGER := 100; -- $1.00 in cents
  max_earning_per_user INTEGER := 1000; -- $10.00 in cents
  affiliate_earning INTEGER;
  referral_id UUID;
  result JSON;
BEGIN
  -- Find the affiliate code
  SELECT * INTO affiliate_code_record 
  FROM public.affiliate_codes 
  WHERE code = p_affiliate_code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid affiliate code');
  END IF;
  
  -- Calculate affiliate earning (capped at $10 total per referred user)
  affiliate_earning := LEAST(discount_amount, max_earning_per_user);
  
  -- Insert referral record
  INSERT INTO public.referrals (
    affiliate_code_id,
    referred_user_id,
    ticket_id,
    discount_amount,
    affiliate_earning
  ) VALUES (
    affiliate_code_record.id,
    p_referred_user_id,
    p_ticket_id,
    discount_amount,
    affiliate_earning
  ) RETURNING id INTO referral_id;
  
  -- Update affiliate code stats
  UPDATE public.affiliate_codes 
  SET 
    total_uses = total_uses + 1,
    total_earnings = total_earnings + affiliate_earning,
    updated_at = now()
  WHERE id = affiliate_code_record.id;
  
  -- Update or insert affiliate earnings summary
  INSERT INTO public.affiliate_earnings (user_id, total_earned, total_referrals)
  VALUES (affiliate_code_record.user_id, affiliate_earning, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_earned = affiliate_earnings.total_earned + affiliate_earning,
    total_referrals = affiliate_earnings.total_referrals + 1,
    updated_at = now();
  
  result := json_build_object(
    'success', true,
    'discount_amount', discount_amount,
    'affiliate_earning', affiliate_earning,
    'referral_id', referral_id
  );
  
  RETURN result;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_affiliate_codes_user_id ON public.affiliate_codes(user_id);
CREATE INDEX idx_affiliate_codes_code ON public.affiliate_codes(code);
CREATE INDEX idx_referrals_affiliate_code_id ON public.referrals(affiliate_code_id);
CREATE INDEX idx_referrals_ticket_id ON public.referrals(ticket_id);
CREATE INDEX idx_affiliate_earnings_user_id ON public.affiliate_earnings(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_affiliate_codes_updated_at
BEFORE UPDATE ON public.affiliate_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_earnings_updated_at
BEFORE UPDATE ON public.affiliate_earnings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();