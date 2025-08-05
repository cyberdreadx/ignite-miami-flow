import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Pin, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MediaUpload, MediaFile, uploadMediaFiles } from '@/components/MediaUpload';
import { MediaDisplay } from '@/components/MediaDisplay';
import { LinkifyText } from '@/components/LinkifyText';
import { CommentsSection } from '@/components/CommentsSection';
import { EventCountdown } from '@/components/EventCountdown';

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

export const SocialFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [clearMediaFiles, setClearMediaFiles] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      // Fetch posts even if not authenticated, but only show pinned posts
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
    fetchPosts(); // Fetch posts regardless of authentication status
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newPost.trim() && selectedMedia.length === 0) || !user) return;

    setPosting(true);
    setUploadProgress(0);
    try {
      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];

      // Upload media files if any
      if (selectedMedia.length > 0) {
        const uploadResult = await uploadMediaFiles(selectedMedia, user.id, (progress) => {
          setUploadProgress(progress);
        });
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
        setClearMediaFiles(true);
        setTimeout(() => setClearMediaFiles(false), 100); // Reset after clearing
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

  const handleDeletePost = async (postId: string) => {
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
        fetchPosts();
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
  };


  // Separate pinned and regular posts
  const pinnedPosts = posts.filter(post => post.pinned);
  const regularPosts = posts.filter(post => !post.pinned).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Show different content based on auth status
  if (!user) {
    return (
      <div className="space-y-6 overflow-hidden">
        {/* Countdown to Next Event */}
        <div className="max-w-2xl mx-auto px-4">
          <EventCountdown />
        </div>
        
        {/* Pinned Posts - Visible to everyone */}
        {pinnedPosts.length > 0 && (
          <div className="space-y-4">
            {pinnedPosts.map((post) => (
              <div key={post.id} className="space-y-0 bg-background border-b border-border/20">
                {/* Header */}
              <div className="max-w-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {post.author_avatar && (
                        <AvatarImage src={post.author_avatar} alt={post.author_name} />
                      )}
                      <AvatarFallback className="text-xs">
                        {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      <p className="font-semibold text-sm truncate">{post.author_name}</p>
                      {post.author_role === 'admin' && (
                        <Badge variant="destructive" className="text-xs h-4 flex-shrink-0">Admin</Badge>
                      )}
                      {post.author_role === 'moderator' && (
                        <Badge variant="outline" className="text-xs h-4 flex-shrink-0">Mod</Badge>
                      )}
                      <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs h-5">
                      <Pin className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Pinned</span>
                    </Badge>
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
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Heart className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.like_count}</span>
                    </div>
                    <CommentsSection 
                      postId={post.id}
                      commentCount={post.comment_count}
                      onCommentCountChange={(newCount) => {
                        setPosts(prev => prev.map(p => 
                          p.id === post.id ? { ...p, comment_count: newCount } : p
                        ));
                      }}
                    />
                  </div>
                </div>
              </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Sign In Prompt */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
            <h2 className="text-2xl font-bold">Join the SkateBurn Community</h2>
            <p className="text-muted-foreground text-center">Sign in to create posts, like content, and join the conversation</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Countdown to Next Event */}
      <div className="max-w-2xl mx-auto px-4">
        <EventCountdown />
      </div>
      
      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-0">
          {pinnedPosts.map((post) => (
            <div key={post.id} className="bg-background border-b border-border/20">
              {/* Header */}
              <div className="max-w-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {post.author_avatar && (
                        <AvatarImage src={post.author_avatar} alt={post.author_name} />
                      )}
                      <AvatarFallback className="text-xs">
                        {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      <p className="font-semibold text-sm truncate">{post.author_name}</p>
                      {post.author_role === 'admin' && (
                        <Badge variant="destructive" className="text-xs h-4 flex-shrink-0">Admin</Badge>
                      )}
                      {post.author_role === 'moderator' && (
                        <Badge variant="outline" className="text-xs h-4 flex-shrink-0">Mod</Badge>
                      )}
                      <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs h-5">
                      <Pin className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Pinned</span>
                    </Badge>
                    <div className="flex gap-1 ml-2">
                      {user?.id === post.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePin(post.id, post.pinned)}
                          className="h-8 w-8 p-0"
                        >
                          <Pin className={`h-4 w-4 ${post.pinned ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                    </div>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.user_liked)}
                      className="flex items-center space-x-1 h-auto p-0 hover:bg-transparent"
                    >
                      <Heart className={`h-5 w-5 ${post.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-sm font-medium">{post.like_count}</span>
                    </Button>
                    <CommentsSection 
                      postId={post.id}
                      commentCount={post.comment_count}
                      onCommentCountChange={(newCount) => {
                        setPosts(prev => prev.map(p => 
                          p.id === post.id ? { ...p, comment_count: newCount } : p
                        ));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Post */}
      <div className="max-w-2xl mx-auto px-4">
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
              <Button 
                type="submit" 
                disabled={posting || (!newPost.trim() && selectedMedia.length === 0)}
              >
                {posting ? (selectedMedia.length > 0 ? `Uploading... ${uploadProgress}%` : 'Posting...') : 'Post'}
              </Button>
            </div>
          </form>
        </CardContent>
          </Card>
        </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-0">
          {regularPosts.map((post) => (
            <div key={post.id} className="bg-background border-b border-border/20">
              {/* Header */}
              <div className="max-w-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {post.author_avatar && (
                        <AvatarImage src={post.author_avatar} alt={post.author_name} />
                      )}
                      <AvatarFallback className="text-xs">
                        {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      <p className="font-semibold text-sm truncate">{post.author_name}</p>
                      {post.author_role === 'admin' && (
                        <Badge variant="destructive" className="text-xs h-4 flex-shrink-0">Admin</Badge>
                      )}
                      {post.author_role === 'moderator' && (
                        <Badge variant="outline" className="text-xs h-4 flex-shrink-0">Mod</Badge>
                      )}
                      <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {user?.id === post.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePin(post.id, post.pinned)}
                        className="h-8 w-8 p-0"
                      >
                        <Pin className={`h-4 w-4 ${post.pinned ? 'fill-current' : ''}`} />
                      </Button>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.user_liked)}
                      className="flex items-center space-x-1 h-auto p-0 hover:bg-transparent"
                    >
                      <Heart className={`h-5 w-5 ${post.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-sm font-medium">{post.like_count}</span>
                    </Button>
                    <CommentsSection 
                      postId={post.id}
                      commentCount={post.comment_count}
                      onCommentCountChange={(newCount) => {
                        setPosts(prev => prev.map(p => 
                          p.id === post.id ? { ...p, comment_count: newCount } : p
                        ));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {regularPosts.length === 0 && pinnedPosts.length === 0 && (
            <div className="max-w-2xl mx-auto px-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};