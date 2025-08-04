-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_posts_with_counts();

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_pinned BOOLEAN NOT NULL DEFAULT false
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage their likes" ON public.likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

-- Create function to get posts with counts
CREATE OR REPLACE FUNCTION public.get_posts_with_counts()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_pinned BOOLEAN,
  like_count BIGINT,
  comment_count BIGINT,
  user_has_liked BOOLEAN,
  author_full_name TEXT,
  author_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.created_at,
    p.updated_at,
    p.is_pinned,
    COALESCE(l.like_count, 0) as like_count,
    COALESCE(c.comment_count, 0) as comment_count,
    COALESCE(ul.user_has_liked, false) as user_has_liked,
    prof.full_name as author_full_name,
    prof.avatar_url as author_avatar_url
  FROM public.posts p
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
  LEFT JOIN (
    SELECT post_id, true as user_has_liked
    FROM public.likes
    WHERE user_id = auth.uid()
  ) ul ON p.id = ul.post_id
  LEFT JOIN public.profiles prof ON p.user_id = prof.user_id
  ORDER BY p.is_pinned DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a post
CREATE OR REPLACE FUNCTION public.create_post(post_content TEXT)
RETURNS UUID AS $$
DECLARE
  new_post_id UUID;
BEGIN
  INSERT INTO public.posts (user_id, content)
  VALUES (auth.uid(), post_content)
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to toggle like
CREATE OR REPLACE FUNCTION public.toggle_like(post_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.likes 
    WHERE user_id = auth.uid() AND post_id = post_id_param
  ) INTO like_exists;
  
  IF like_exists THEN
    DELETE FROM public.likes 
    WHERE user_id = auth.uid() AND post_id = post_id_param;
    RETURN false;
  ELSE
    INSERT INTO public.likes (user_id, post_id) 
    VALUES (auth.uid(), post_id_param);
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to toggle pin (admin only)
CREATE OR REPLACE FUNCTION public.toggle_pin(post_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  current_pin_status BOOLEAN;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE user_id = auth.uid();
  
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can pin posts';
  END IF;
  
  SELECT is_pinned INTO current_pin_status FROM public.posts WHERE id = post_id_param;
  
  UPDATE public.posts 
  SET is_pinned = NOT current_pin_status,
      updated_at = now()
  WHERE id = post_id_param;
  
  RETURN NOT current_pin_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;