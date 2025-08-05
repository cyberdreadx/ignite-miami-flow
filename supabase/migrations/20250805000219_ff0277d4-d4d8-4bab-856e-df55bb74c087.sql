-- Update create_post function to handle media
DROP FUNCTION IF EXISTS public.create_post(text);

CREATE OR REPLACE FUNCTION public.create_post(
  post_content text,
  media_urls text[] DEFAULT NULL,
  media_types text[] DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_post_id uuid;
BEGIN
  INSERT INTO public.posts (content, user_id, media_urls, media_types)
  VALUES (post_content, auth.uid(), media_urls, media_types)
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$;