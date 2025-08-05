import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MediaUpload, MediaFile, uploadMediaFiles } from '@/components/MediaUpload';
import { MediaDisplay } from '@/components/MediaDisplay';
import { LinkifyText } from '@/components/LinkifyText';

interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  like_count: number;
  comment_count: number;
  user_liked: boolean;
  author_name: string;
  author_role: string;
  author_avatar: string | null;
  media_urls: string[] | null;
  media_types: string[] | null;
}

export const SocialFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      // First get posts with basic info
      const { data: postsData, error: postsError } = await supabase
        .rpc('get_posts_with_counts');

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        setLoading(false);
        return;
      }

      setPosts(postsData || []);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newPost.trim() && selectedMedia.length === 0) || !user) return;

    setPosting(true);
    try {
      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];

      // Upload media files if any
      if (selectedMedia.length > 0) {
        const uploadResult = await uploadMediaFiles(selectedMedia, user.id);
        mediaUrls = uploadResult.urls;
        mediaTypes = uploadResult.types;
      }

      const { error } = await supabase.rpc('create_post', {
        post_content: newPost.trim() || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        media_types: mediaTypes.length > 0 ? mediaTypes : null
      });

      if (error) {
        toast({
          title: 'Error creating post',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setNewPost('');
        setSelectedMedia([]);
        // Clean up object URLs
        selectedMedia.forEach(file => URL.revokeObjectURL(file.url));
        fetchPosts();
        toast({
          title: 'Post created!',
          description: 'Your post has been shared with the community.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error creating post',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
    setPosting(false);
  };

  const handleMediaChange = (files: MediaFile[]) => {
    setSelectedMedia(files);
  };

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('toggle_like', {
        post_id: postId
      });

      if (!error) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handlePin = async (postId: string, currentlyPinned: boolean) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase.rpc('toggle_pin', {
        post_id: postId
      });

      if (error) {
        toast({
          title: 'Error updating post',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        fetchPosts();
        toast({
          title: currentlyPinned ? 'Post unpinned' : 'Post pinned',
          description: currentlyPinned ? 'Post removed from top of feed.' : 'Post pinned to top of feed.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating post',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Join the SkateBurn Community</h2>
        <p className="text-muted-foreground">Sign in to see posts and join the conversation</p>
        <Button onClick={() => window.location.href = '/auth'}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea
              placeholder="What's happening at SkateBurn?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            
            {/* Media Upload */}
            <MediaUpload 
              onMediaChange={handleMediaChange}
              maxFiles={4}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={posting || (!newPost.trim() && selectedMedia.length === 0)}
              >
                {posting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="relative">
              {post.pinned && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      {post.author_avatar && (
                        <AvatarImage src={post.author_avatar} alt={post.author_name} />
                      )}
                      <AvatarFallback>
                        {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.author_name}</p>
                      <div className="flex items-center gap-2">
                        {post.author_role === 'admin' && (
                          <Badge variant="destructive" className="text-xs">Admin</Badge>
                        )}
                        {post.author_role === 'moderator' && (
                          <Badge variant="outline" className="text-xs">Mod</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePin(post.id, post.pinned)}
                    >
                      <Pin className={`h-4 w-4 ${post.pinned ? 'fill-current' : ''}`} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {post.content && (
                  <LinkifyText 
                    text={post.content}
                    className="whitespace-pre-wrap mb-4 block"
                  />
                )}
                
                {/* Media Display */}
                <MediaDisplay 
                  mediaUrls={post.media_urls}
                  mediaTypes={post.media_types}
                  className="mb-4"
                />
                
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id, post.user_liked)}
                    className="flex items-center space-x-2"
                  >
                    <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.like_count}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comment_count}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};