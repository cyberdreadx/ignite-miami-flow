import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  EyeOff,
  Code,
  Target,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AffiliateCode {
  id: string;
  code: string;
  user_id: string;
  is_active: boolean;
  total_uses: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

interface AffiliateEarnings {
  id: string;
  user_id: string;
  total_earned: number;
  total_referrals: number;
  last_payout_at: string | null;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface AffiliateReferral {
  id: string;
  affiliate_code_id: string;
  referred_user_id: string | null;
  ticket_id: string | null;
  discount_amount: number;
  affiliate_earning: number;
  created_at: string;
  affiliate_code: string;
  referred_user_name: string | null;
}

const AdminAffiliateManager = () => {
  const [affiliateCodes, setAffiliateCodes] = useState<AffiliateCode[]>([]);
  const [affiliateEarnings, setAffiliateEarnings] = useState<AffiliateEarnings[]>([]);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      // Fetch affiliate codes
      const { data: codesData, error: codesError } = await supabase
        .from('affiliate_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (codesError) {
        console.error('Error fetching affiliate codes:', codesError);
        return;
      }

      // Fetch affiliate earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .order('total_earned', { ascending: false });

      if (earningsError) {
        console.error('Error fetching affiliate earnings:', earningsError);
        return;
      }

      // Fetch recent referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        return;
      }

      // Get all unique user IDs
      const allUserIds = [
        ...(codesData || []).map(c => c.user_id),
        ...(earningsData || []).map(e => e.user_id),
        ...(referralsData || []).map(r => r.referred_user_id).filter(Boolean)
      ];
      const uniqueUserIds = [...new Set(allUserIds)];

      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', uniqueUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get affiliate codes with their code values for referrals
      const { data: codesLookup, error: codesLookupError } = await supabase
        .from('affiliate_codes')
        .select('id, code');

      if (codesLookupError) {
        console.error('Error fetching codes lookup:', codesLookupError);
        return;
      }

      // Create lookup maps
      const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const codeMap = new Map(codesLookup?.map(c => [c.id, c.code]) || []);

      // Map the data
      const mappedCodes = (codesData || []).map(code => {
        const profile = profileMap.get(code.user_id);
        return {
          ...code,
          user_name: profile?.full_name || profile?.email || 'Unknown',
          user_email: profile?.email || 'Unknown'
        };
      });

      const mappedEarnings = (earningsData || []).map(earning => {
        const profile = profileMap.get(earning.user_id);
        return {
          ...earning,
          user_name: profile?.full_name || profile?.email || 'Unknown',
          user_email: profile?.email || 'Unknown'
        };
      });

      const mappedReferrals = (referralsData || []).map(referral => {
        const profile = referral.referred_user_id ? profileMap.get(referral.referred_user_id) : null;
        return {
          ...referral,
          affiliate_code: codeMap.get(referral.affiliate_code_id) || 'Unknown',
          referred_user_name: profile?.full_name || profile?.email || null
        };
      });

      setAffiliateCodes(mappedCodes);
      setAffiliateEarnings(mappedEarnings);
      setReferrals(mappedReferrals);
    } catch (error) {
      console.error('Error in fetchAffiliateData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('affiliate_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) {
        toast({
          title: 'Error updating code status',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        fetchAffiliateData();
        toast({
          title: 'Code status updated',
          description: `Code ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating code status',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const filteredCodes = affiliateCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalCodes: affiliateCodes.length,
    activeCodes: affiliateCodes.filter(c => c.is_active).length,
    totalEarnings: affiliateEarnings.reduce((sum, e) => sum + e.total_earned, 0),
    totalReferrals: affiliateEarnings.reduce((sum, e) => sum + e.total_referrals, 0),
    totalUses: affiliateCodes.reduce((sum, c) => sum + c.total_uses, 0)
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading affiliate data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalCodes}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.activeCodes} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUses}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.totalReferrals} referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalStats.totalEarnings / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Owed to affiliates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Code</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalCodes > 0 ? (totalStats.totalUses / totalStats.totalCodes).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Uses per code</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalUses > 0 ? ((totalStats.totalReferrals / totalStats.totalUses) * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">Code to sale rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="search">Search codes or users:</Label>
        <Input
          id="search"
          placeholder="Search by code, name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Affiliate Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Codes</CardTitle>
          <CardDescription>
            Manage affiliate codes and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No affiliate codes found</p>
              </div>
            ) : (
              filteredCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg space-y-3 lg:space-y-0"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback>
                        {code.user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-lg">{code.code}</p>
                        <Badge variant={code.is_active ? 'default' : 'secondary'}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="font-medium">{code.user_name}</p>
                      <p className="text-sm text-muted-foreground">{code.user_email}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{code.total_uses} uses</span>
                        <span>•</span>
                        <span>${(code.total_earnings / 100).toFixed(2)} earned</span>
                        <span>•</span>
                        <span>Created {formatDistanceToNow(new Date(code.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={code.is_active}
                        onCheckedChange={() => handleToggleCodeStatus(code.id, code.is_active)}
                      />
                      <Label className="text-sm">
                        {code.is_active ? 'Active' : 'Inactive'}
                      </Label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Earners */}
      <Card>
        <CardHeader>
          <CardTitle>Top Affiliate Earners</CardTitle>
          <CardDescription>
            Users with the highest affiliate earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {affiliateEarnings.slice(0, 10).map((earning) => (
              <div
                key={earning.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {earning.user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{earning.user_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {earning.total_referrals} referrals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(earning.total_earned / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {earning.last_payout_at 
                      ? `Last paid ${formatDistanceToNow(new Date(earning.last_payout_at), { addSuffix: true })}`
                      : 'No payouts yet'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>
            Latest affiliate referral activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {referrals.slice(0, 20).map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{referral.affiliate_code}</Badge>
                    <span className="text-sm">→</span>
                    <span className="text-sm">
                      {referral.referred_user_name || 'Anonymous User'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(referral.affiliate_earning / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Earned</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAffiliateManager;