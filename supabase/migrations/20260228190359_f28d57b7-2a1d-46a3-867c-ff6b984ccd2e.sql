
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  new_code text := '';
  i int;
  attempt int := 0;
BEGIN
  LOOP
    new_code := '';
    FOR i IN 1..6 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM public.affiliate_codes ac WHERE ac.code = new_code) THEN
      RETURN new_code;
    END IF;
    attempt := attempt + 1;
    IF attempt > 100 THEN
      RAISE EXCEPTION 'Could not generate unique affiliate code after 100 attempts';
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_affiliate_code() TO authenticated;
