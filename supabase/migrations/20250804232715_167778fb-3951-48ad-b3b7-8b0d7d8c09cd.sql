-- Fix security warnings by adding search_path to functions

-- Update existing functions to include search_path
CREATE OR REPLACE FUNCTION public.get_posts_with_counts()
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  pinned BOOLEAN,
  like_count BIGINT,
  comment_count BIGINT,
  user_liked BOOLEAN,
  author_name TEXT,
  author_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.created_at,
    p.updated_at,
    p.pinned,
    COALESCE(l.like_count, 0) as like_count,
    COALESCE(c.comment_count, 0) as comment_count,
    CASE WHEN ul.user_id IS NOT NULL THEN TRUE ELSE FALSE END as user_liked,
    COALESCE(pr.full_name, 'Unknown User') as author_name,
    COALESCE(pr.role, 'user') as author_role
  FROM public.posts p
  LEFT JOIN public.profiles pr ON p.user_id = pr.user_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM public.likes
    GROUP BY post_id
  ) l ON p.id = l.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM public.comments
    GROUP BY post_id
  ) c ON p.id = c.post_id
  LEFT JOIN public.likes ul ON p.id = ul.post_id AND ul.user_id = auth.uid()
  ORDER BY p.pinned DESC, p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_post(post_content TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_post_id UUID;
BEGIN
  INSERT INTO public.posts (content, user_id)
  VALUES (post_content, auth.uid())
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_like(post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing_like_id UUID;
BEGIN
  -- Check if user already liked this post
  SELECT id INTO existing_like_id
  FROM public.likes
  WHERE post_id = toggle_like.post_id AND user_id = auth.uid();
  
  IF existing_like_id IS NOT NULL THEN
    -- Unlike the post
    DELETE FROM public.likes WHERE id = existing_like_id;
    RETURN FALSE;
  ELSE
    -- Like the post
    INSERT INTO public.likes (post_id, user_id)
    VALUES (toggle_like.post_id, auth.uid());
    RETURN TRUE;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_pin(post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
  current_pinned BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT role INTO user_role
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can pin/unpin posts';
  END IF;
  
  -- Get current pinned status
  SELECT pinned INTO current_pinned
  FROM public.posts
  WHERE id = toggle_pin.post_id;
  
  -- Toggle pinned status
  UPDATE public.posts
  SET pinned = NOT current_pinned
  WHERE id = toggle_pin.post_id;
  
  RETURN NOT current_pinned;
END;
$$;