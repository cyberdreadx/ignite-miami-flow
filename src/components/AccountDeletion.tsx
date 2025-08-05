import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const AccountDeletion: React.FC = () => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDeleteRequest = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user.id,
          reason: reason.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Deletion Request Submitted",
        description: "Your account deletion request has been submitted for admin review. You'll be notified when it's processed.",
        variant: "default",
      });

      setReason('');
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      toast({
        title: "Request Failed",
        description: "Failed to submit account deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="w-5 h-5" />
          Delete Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="font-semibold text-destructive">Warning</span>
          </div>
          <p className="text-sm text-destructive/80">
            This action will permanently delete your account and all associated data including:
          </p>
          <ul className="text-sm text-destructive/80 list-disc list-inside space-y-1">
            <li>Your profile and personal information</li>
            <li>All posts, comments, and likes</li>
            <li>Tickets and subscriptions</li>
            <li>Media passes and uploads</li>
          </ul>
          <p className="text-sm text-destructive/80 font-medium">
            This action cannot be undone and requires admin approval.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Reason for deletion (optional)
          </label>
          <Textarea
            placeholder="Please let us know why you want to delete your account..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={isSubmitting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Request Account Deletion
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will submit a request to permanently delete your account. 
                An admin will review your request before the deletion is processed.
                All your data will be permanently removed and cannot be recovered.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRequest}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Deletion Request'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};