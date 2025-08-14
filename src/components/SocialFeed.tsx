import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Pin, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { MediaUpload, MediaFile, uploadMediaFiles } from '@/components/MediaUpload';
import { MediaDisplay } from '@/components/MediaDisplay';
import { LinkifyText } from '@/components/LinkifyText';
import { CommentsSection } from '@/components/CommentsSection';
import { EventCountdown } from '@/components/EventCountdown';
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const postVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
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
    y: -50,
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
};

const likeVariants = {
  hover: {
    scale: 1.1,
    transition: { type: "spring" as const, stiffness: 400, damping: 10 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring" as const, stiffness: 400, damping: 10 }
  }
};

// Query function for fetching posts
const fetchPosts = async (): Promise<Post[]> => {
  const { data: postsData, error: postsError } = await supabase
    .rpc('get_posts_with_counts');

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    throw new Error(postsError.message);
  }

  return postsData || [];
};

export const SocialFeed = React.memo(() => {
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [clearMediaFiles, setClearMediaFiles] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Use React Query for posts with better caching
  const { 
    data: posts = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, mediaUrls, mediaTypes }: { 
      content: string | null; 
      mediaUrls: string[] | null; 
      mediaTypes: string[] | null 
    }) => {
      const { error } = await supabase.rpc('create_post', {
        post_content: content,
        media_urls: mediaUrls,
        media_types: mediaTypes
      });
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPost('');
      setSelectedMedia([]);
      setClearMediaFiles(true);
      setTimeout(() => setClearMediaFiles(false), 100);
      toast({
        title: 'Post created!',
        description: 'Your post has been shared with the community.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating post',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setPosting(false);
    }
  });

  const handleCreatePost = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newPost.trim() && selectedMedia.length === 0) || !user) return;

    setPosting(true);
    setUploadProgress(0);
    
    try {
      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];

      if (selectedMedia.length > 0) {
        const uploadResult = await uploadMediaFiles(selectedMedia, user.id, (progress) => {
          setUploadProgress(progress);
        });
        mediaUrls = uploadResult.urls;
        mediaTypes = uploadResult.types;
      }

      createPostMutation.mutate({
        content: newPost.trim() || null,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
        mediaTypes: mediaTypes.length > 0 ? mediaTypes : null
      });
    } catch (error) {
      toast({
        title: 'Error uploading media',
        description: 'Failed to upload media files.',
        variant: 'destructive',
      });
      setPosting(false);
    }
  }, [newPost, selectedMedia, user, createPostMutation, toast]);

  const handleMediaChange = useCallback((files: MediaFile[]) => {
    setSelectedMedia(files);
  }, []);

  const handleLike = useCallback(async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('toggle_like', {
        post_id: postId
      });

      if (!error) {
        // Invalidate posts query to refetch data
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [user, queryClient]);

  const handlePin = useCallback(async (postId: string, currentlyPinned: boolean) => {
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
        // Invalidate posts query to refetch data
        queryClient.invalidateQueries({ queryKey: ['posts'] });
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
  }, [isAdmin, queryClient, toast]);

  const handleDeletePost = useCallback(async (postId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: 'Error deleting post',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Invalidate posts query to refetch data
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        toast({
          title: 'Post deleted',
          description: 'Your post has been deleted successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error deleting post',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [user, queryClient, toast]);

  const pinnedPosts = posts.filter(post => post.pinned);
  const regularPosts = posts.filter(post => !post.pinned).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Component for rendering a post
  const PostComponent = ({ post }: { post: Post }) => (
    <motion.div 
      key={post.id} 
      className="bg-background border-b border-border/20 hover:bg-muted/20 transition-colors duration-300"
      variants={postVariants}
      whileHover={{ 
        y: -2,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      layout
    >
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="flex space-x-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              {post.author_avatar && (
                <AvatarImage src={post.author_avatar} alt={post.author_name} />
              )}
              <AvatarFallback className="text-xs">
                {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{post.author_name}</p>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              <UserRoleBadges userId={post.user_id} />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {post.pinned && (
              <Badge variant="secondary" className="text-xs h-5">
                <Pin className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Pinned</span>
              </Badge>
            )}
            {(user?.id === post.user_id || isAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => handlePin(post.id, post.pinned)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {post.pinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                  )}
                  {user?.id === post.user_id && (
                    <DropdownMenuItem 
                      onClick={() => handleDeletePost(post.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <LinkifyText 
            text={post.content}
            className="whitespace-pre-wrap text-sm"
          />
        </div>
      )}
      
      {/* Media Display */}
      <div className="max-w-2xl mx-auto px-4 pb-3">
        <MediaDisplay 
          mediaUrls={post.media_urls}
          mediaTypes={post.media_types}
        />
      </div>
      
      {/* Interaction buttons */}
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {user ? (
              <motion.div
                variants={likeVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id, post.user_liked)}
                  className="flex items-center space-x-1 h-auto p-0 hover:bg-transparent"
                >
                  <motion.div
                    animate={post.user_liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className={`h-5 w-5 ${post.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </motion.div>
                  <span className="text-sm font-medium">{post.like_count}</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center space-x-1 text-muted-foreground"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">{post.like_count}</span>
              </motion.div>
            )}
            <CommentsSection 
              postId={post.id}
              commentCount={post.comment_count}
              onCommentCountChange={(newCount) => {
                // Optimistically update the cache
                queryClient.setQueryData(['posts'], (oldData: Post[] | undefined) => {
                  if (!oldData) return oldData;
                  return oldData.map(p => 
                    p.id === post.id ? { ...p, comment_count: newCount } : p
                  );
                });
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Show different content based on auth status
  if (!user) {
    return (
      <motion.div 
        className="space-y-6 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Countdown to Next Event */}
        <motion.div 
          className="max-w-2xl mx-auto px-4"
          variants={postVariants}
        >
          <EventCountdown />
        </motion.div>
        
        {/* Pinned Posts - Visible to everyone */}
        <AnimatePresence>
          {pinnedPosts.length > 0 && (
            <motion.div 
              className="space-y-0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {pinnedPosts.map((post) => (
                <PostComponent key={post.id} post={post} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Sign In Prompt */}
        <motion.div 
          className="max-w-2xl mx-auto px-4"
          variants={postVariants}
        >
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[30vh] space-y-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.h2 
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Join the SkateBurn Community
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Sign in to create posts, like content, and join the conversation
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Countdown to Next Event */}
      <motion.div 
        className="max-w-2xl mx-auto px-4"
        variants={postVariants}
      >
        <EventCountdown />
      </motion.div>
      
      {/* Pinned Posts */}
      <AnimatePresence>
        {pinnedPosts.length > 0 && (
          <motion.div 
            className="space-y-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {pinnedPosts.map((post) => (
              <PostComponent key={post.id} post={post} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Create Post */}
      <motion.div 
        className="max-w-2xl mx-auto px-4"
        variants={postVariants}
        whileHover={{ 
          y: -2,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
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
                clearFiles={clearMediaFiles}
              />
              
              {/* Upload Progress */}
              {posting && selectedMedia.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading media...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
              
              <div className="flex justify-end">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button 
                    type="submit" 
                    disabled={(!newPost.trim() && selectedMedia.length === 0) || posting}
                    className="min-w-[100px]"
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </Button>
                </motion.div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Regular Posts */}
      <AnimatePresence>
        {regularPosts.length > 0 && (
          <motion.div 
            className="space-y-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {regularPosts.map((post) => (
              <PostComponent key={post.id} post={post} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {regularPosts.length === 0 && pinnedPosts.length === 0 && !loading && (
        <motion.div 
          className="max-w-2xl mx-auto px-4"
          variants={postVariants}
        >
          <div className="text-center py-8">
            <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div 
          className="flex justify-center py-8"
          variants={postVariants}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </motion.div>
      )}
    </motion.div>
  );
});

SocialFeed.displayName = 'SocialFeed';