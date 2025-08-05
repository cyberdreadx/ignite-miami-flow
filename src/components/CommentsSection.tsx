import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { LinkifyText } from '@/components/LinkifyText';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_role: string;
  author_avatar: string | null;
}

interface CommentsSectionProps {
  postId: string;
  commentCount: number;
  onCommentCountChange: (newCount: number) => void;
}

export const CommentsSection = ({ postId, commentCount, onCommentCountChange }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!showComments) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      // Get user profiles separately for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, role, avatar_url, email')
            .eq('user_id', comment.user_id)
            .single();

          return {
            ...comment,
            author_name: profileData?.full_name || profileData?.email || 'Anonymous',
            author_role: profileData?.role || 'user',
            author_avatar: profileData?.avatar_url
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: postId,
          user_id: user.id
        });

      if (error) {
        toast({
          title: 'Error posting comment',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setNewComment('');
        fetchComments();
        onCommentCountChange(commentCount + 1);
        toast({
          title: 'Comment posted!',
          description: 'Your comment has been added.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error posting comment',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
    setPosting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: 'Error deleting comment',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        fetchComments();
        onCommentCountChange(Math.max(0, commentCount - 1));
        toast({
          title: 'Comment deleted',
          description: 'Your comment has been deleted.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error deleting comment',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="space-y-3">
      {/* Comments Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleComments}
        className="flex items-center space-x-1 h-auto p-0 hover:bg-transparent"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">{commentCount}</span>
        <span className="text-sm text-muted-foreground ml-1">
          {showComments ? 'Hide' : 'View'} comments
        </span>
      </Button>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pt-2 border-t border-border/20">
          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt="Your avatar" />
                  <AvatarFallback className="text-xs">
                    {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none text-sm text-base"
                    style={{ fontSize: '16px' }}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={posting || !newComment.trim()}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {posting ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {comment.author_avatar && (
                      <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                    )}
                    <AvatarFallback className="text-xs">
                      {comment.author_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{comment.author_name}</p>
                      {comment.author_role === 'admin' && (
                        <Badge variant="destructive" className="text-xs h-4">Admin</Badge>
                      )}
                      {comment.author_role === 'moderator' && (
                        <Badge variant="outline" className="text-xs h-4">Mod</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0 ml-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <LinkifyText 
                      text={comment.content}
                      className="text-sm whitespace-pre-wrap"
                    />
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}

          {!user && (
            <p className="text-center text-muted-foreground text-sm py-4">
              Sign in to join the conversation
            </p>
          )}
        </div>
      )}
    </div>
  );
};