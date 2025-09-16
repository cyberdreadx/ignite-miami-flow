import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  Copy, 
  Plus, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Link as LinkIcon,
  Eye,
  EyeOff,
  Share2,
  Gift
} from 'lucide-react';

interface AffiliateCode {
  id: string;
  code: string;
  is_active: boolean;
  total_uses: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

interface Referral {
  id: string;
  discount_amount: number;
  affiliate_earning: number;
  created_at: string;
  referred_user_id: string;
  ticket_id: string;
  profiles?: {
    user_id: string;
    full_name: string;
    email: string;
  } | null;
}

interface AffiliateEarnings {
  total_earned: number;
  total_referrals: number;
  last_payout_at: string | null;
}

const AffiliateDashboard = () => {
  const [affiliateCodes, setAffiliateCodes] = useState<AffiliateCode[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<AffiliateEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAllCodes, setShowAllCodes] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAffiliateData();
    }
  }, [user]);

  const fetchAffiliateData = async () => {
    try {
      // Fetch affiliate codes
      const { data: codes, error: codesError } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;

      // Fetch earnings summary
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (earningsError && earningsError.code !== 'PGRST116') {
        console.error('Error fetching earnings:', earningsError);
      }

      // Fetch recent referrals with user info
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          discount_amount,
          affiliate_earning,
          created_at,
          referred_user_id,
          ticket_id
        `)
        .in('affiliate_code_id', codes?.map(c => c.id) || [])
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch user profiles separately if we have referrals
      let referralsWithProfiles = referralsData || [];
      if (referralsData && referralsData.length > 0) {
        const userIds = referralsData
          .filter(r => r.referred_user_id)
          .map(r => r.referred_user_id);
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', userIds);

          referralsWithProfiles = referralsData.map(referral => ({
            ...referral,
            profiles: profilesData?.find(p => p.user_id === referral.referred_user_id) || null
          }));
        }
      }

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      }

      setAffiliateCodes(codes || []);
      setEarnings(earningsData);
      setReferrals(referralsWithProfiles);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: 'Error loading affiliate data',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateCode = async () => {
    if (!user) return;
    
    setGenerating(true);
    try {
      // Generate unique code
      const { data: newCode, error: generateError } = await supabase
        .rpc('generate_affiliate_code');

      if (generateError) throw generateError;

      // Insert new affiliate code
      const { error: insertError } = await supabase
        .from('affiliate_codes')
        .insert({
          user_id: user.id,
          code: newCode
        });

      if (insertError) throw insertError;

      toast({
        title: 'Affiliate code created! 🎉',
        description: `Your new code "${newCode}" is ready to use.`,
      });

      fetchAffiliateData();
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: 'Error creating affiliate code',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyAffiliateLink = (code: string) => {
    const link = `${window.location.origin}/tickets?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied! 📋',
      description: 'Your affiliate link has been copied to clipboard.',
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code copied! 📋',
      description: `Code "${code}" copied to clipboard.`,
    });
  };

  const shareAffiliateLink = async (code: string) => {
    const link = `${window.location.origin}/tickets?ref=${code}`;
    const text = `Get your SkateBurn ticket with my code: ${code}! 🔥`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkateBurn Affiliate Code',
          text: text,
          url: link,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying
      navigator.clipboard.writeText(`${text}\n\n${link}`);
      toast({
        title: 'Share text copied! 📋',
        description: 'Share text and link copied to clipboard.',
      });
    }
  };

  const toggleCodeActive = async (codeId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('affiliate_codes')
        .update({ is_active: !currentActive })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: currentActive ? 'Code deactivated' : 'Code activated',
        description: currentActive 
          ? 'Your affiliate code is now inactive.' 
          : 'Your affiliate code is now active.',
      });

      fetchAffiliateData();
    } catch (error) {
      console.error('Error toggling code:', error);
      toast({
        title: 'Error updating code',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayCodes = showAllCodes ? affiliateCodes : affiliateCodes.slice(0, 3);
  const totalEarnings = earnings?.total_earned || 0;
  const totalReferrals = earnings?.total_referrals || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">
            Earn $1 for every friend you refer! Share your codes and start earning.
          </p>
        </div>
        <Button onClick={generateAffiliateCode} disabled={generating}>
          <Plus className="h-4 w-4 mr-2" />
          {generating ? 'Creating...' : 'New Code'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(totalEarnings / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalReferrals} referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {affiliateCodes.filter(c => c.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {affiliateCodes.length} total codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {affiliateCodes.reduce((sum, code) => sum + code.total_uses, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful referrals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Codes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Your Affiliate Codes
              </CardTitle>
              <CardDescription>
                Share these codes to earn $1 for each friend who buys a ticket
              </CardDescription>
            </div>
            {affiliateCodes.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllCodes(!showAllCodes)}
              >
                {showAllCodes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showAllCodes ? 'Show Less' : `Show All (${affiliateCodes.length})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {affiliateCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No affiliate codes yet</p>
              <p className="mb-4">Create your first affiliate code to start earning!</p>
              <Button onClick={generateAffiliateCode} disabled={generating}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-lg font-mono font-bold bg-muted px-2 py-1 rounded">
                          {code.code}
                        </code>
                        <Badge variant={code.is_active ? 'default' : 'secondary'}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{code.total_uses} uses</span>
                        <span>${(code.total_earnings / 100).toFixed(2)} earned</span>
                        <span>Created {formatDistanceToNow(new Date(code.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCode(code.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyAffiliateLink(code.code)}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareAffiliateLink(code.code)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={code.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleCodeActive(code.id, code.is_active)}
                    >
                      {code.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Referrals
          </CardTitle>
          <CardDescription>
            Your latest successful referrals and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No referrals yet</p>
              <p>Share your affiliate codes to start earning!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {referral.profiles?.full_name?.charAt(0) || 
                         referral.profiles?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {referral.profiles?.full_name || referral.profiles?.email || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +${(referral.affiliate_earning / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Referral bonus earned
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateDashboard;