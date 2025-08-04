-- Update the get_posts_with_counts function to include profile information
CREATE OR REPLACE FUNCTION public.get_posts_with_counts()
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  pinned boolean,
  like_count bigint,
  comment_count bigint,
  user_liked boolean,
  author_name text,
  author_role text,
  author_avatar text
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    p.id,
    p.content,
    p.created_at,
    p.updated_at,
    p.is_pinned as pinned,
    COALESCE(l.like_count, 0) as like_count,
    COALESCE(c.comment_count, 0) as comment_count,
    CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END as user_liked,
    COALESCE(pr.full_name, pr.email, 'Anonymous') as author_name,
    COALESCE(pr.role, 'user') as author_role,
    pr.avatar_url as author_avatar
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
  ORDER BY p.is_pinned DESC, p.created_at DESC;
$$;