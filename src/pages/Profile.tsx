import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Heart, MessageCircle, Trash2, MoreHorizontal, Pin, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NavBar from '@/components/NavBar';
import { AvatarUpload } from '@/components/AvatarUpload';
import { AccountDeletion } from '@/components/AccountDeletion';
import { UserPosts } from '@/components/UserPosts';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    avatar_url: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Profile page useEffect - user:', user, 'authLoading:', authLoading);
    
    // Don't redirect while auth is still loading
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    if (user) {
      console.log('User is authenticated, fetching profile');
      fetchProfile();
    } else {
      console.log('User not authenticated, redirecting to auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data.',
          variant: 'destructive',
        });
      } else {
        setProfile(data || { full_name: '', email: user.email || '', avatar_url: null });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          email: profile.email
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Profile updated!',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
  };

  if (authLoading || loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center pt-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-dark p-6 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Header with Back and Settings */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Settings Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-graffiti bg-gradient-fire bg-clip-text text-transparent">
                    Profile Settings
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Profile Form */}
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-background/50"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-background/50"
                        placeholder="Enter your email"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed here. Contact support if needed.
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>

                  {/* Account Deletion Section */}
                  <div className="pt-6 mt-6 border-t border-border">
                    <AccountDeletion />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Profile Content */}
          <div className="text-center mb-8">
            {/* Avatar Section */}
            <div className="mb-6">
              <AvatarUpload 
                currentAvatar={profile.avatar_url}
                userName={profile.full_name || profile.email}
                onAvatarUpdate={handleAvatarUpdate}
                size="lg"
              />
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-2xl font-graffiti bg-gradient-fire bg-clip-text text-transparent mb-2">
                {profile.full_name || profile.email}
              </h1>
              <p className="text-muted-foreground text-sm">
                {user?.email}
              </p>
            </div>
          </div>

          {/* User Posts Section */}
          <UserPosts />
        </div>
      </div>
    </>
  );
};

export default Profile;