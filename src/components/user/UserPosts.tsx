import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Pin, Trash2, MoreHorizontal, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { MediaDisplay } from '@/components/MediaDisplay';
import { LinkifyText } from '@/components/LinkifyText';
import { CommentsSection } from '@/components/CommentsSection';
import { UserRoleBadges } from '@/components/UserRoleBadges';

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
  user_id: string;
}

const postVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      duration: 0.6
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
};

export const UserPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_posts_with_counts')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter posts to only show user's own posts
      const userPosts = data?.filter(post => post.user_id === user.id) || [];
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your posts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const { data: liked, error } = await supabase.rpc('toggle_like', {
        post_id: postId
      });

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              user_liked: liked,
              like_count: liked ? post.like_count + 1 : post.like_count - 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like status.',
        variant: 'destructive',
      });
    }
  };

  const handlePin = async (postId: string) => {
    if (!user) return;

    try {
      const { data: pinned, error } = await supabase.rpc('toggle_pin', {
        post_id: postId
      });

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, pinned }
          : post
      ));

      toast({
        title: pinned ? 'Post pinned!' : 'Post unpinned!',
        description: pinned ? 'Your post has been pinned to the top.' : 'Your post has been unpinned.',
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: 'Error',
        description: 'Failed to pin/unpin post.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setPosts(prev => prev.filter(post => post.id !== postId));

      toast({
        title: 'Post deleted!',
        description: 'Your post has been removed successfully.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-normal text-glow-yellow">
            My Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/10 backdrop-blur-lg border border-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-normal text-glow-yellow">
          My Posts ({posts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You haven't posted anything yet.</p>
            <p className="text-sm">Share your skating moments with the community!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={postVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <Card className="bg-card/5 border border-white/5 hover:border-white/10 transition-all duration-300">
                    <CardContent className="p-4">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.author_avatar || undefined} />
                            <AvatarFallback>
                              {post.author_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{post.author_name}</p>
                              <UserRoleBadges userId={post.user_id} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at))} ago
                              {post.pinned && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Pinned
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePin(post.id)}>
                              <Pin className="h-4 w-4 mr-2" />
                              {post.pinned ? 'Unpin' : 'Pin'} Post
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(post.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Post Content */}
                      {post.content && (
                        <div className="mb-3">
                          <LinkifyText text={post.content} />
                        </div>
                      )}

                      {/* Media */}
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className="mb-3">
                          <MediaDisplay 
                            mediaUrls={post.media_urls} 
                            mediaTypes={post.media_types || []} 
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center space-x-4">
                          <motion.button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-1 transition-colors ${
                              post.user_liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`} />
                            <span className="text-sm">{post.like_count}</span>
                          </motion.button>
                          
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{post.comment_count}</span>
                          </div>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="mt-4">
                        <CommentsSection 
                          postId={post.id} 
                          commentCount={post.comment_count}
                          onCommentCountChange={(count) => {
                            setPosts(prev => prev.map(p => 
                              p.id === post.id ? { ...p, comment_count: count } : p
                            ));
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};