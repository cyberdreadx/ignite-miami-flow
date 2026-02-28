import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Trophy, DollarSign, Ticket, TrendingUp, Star, Crown } from 'lucide-react';

interface AffiliateCodeRow {
  id: string;
  code: string;
  user_id: string;
  is_active: boolean | null;
  tier: string;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  email: string;
  total_sales: number;
  total_earnings: number; // in cents
  active_codes: number;
  codes: string[];
  tier: 'standard' | 'promoter'; // highest tier across codes
  code_ids: string[]; // for tier toggling
}

const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

const AffiliateLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTier, setUpdatingTier] = useState<string | null>(null);
  const [totalStats, setTotalStats] = useState({ totalSales: 0, totalEarnings: 0, totalAffiliates: 0 });
  const { toast } = useToast();

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: codes, error: codesErr } = await supabase
        .from('affiliate_codes')
        .select('id, code, user_id, is_active, tier');

      if (codesErr) throw codesErr;
      if (!codes || codes.length === 0) {
        setLeaders([]);
        setLoading(false);
        return;
      }

      const { data: earnings, error: earningsErr } = await supabase
        .from('affiliate_earnings')
        .select('affiliate_code_id, amount');

      if (earningsErr) throw earningsErr;

      const userIds = [...new Set(codes.map(c => c.user_id))];
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, email')
        .in('user_id', userIds);

      if (profilesErr) throw profilesErr;

      const earningsByCode: Record<string, { sales: number; earnings: number }> = {};
      for (const e of earnings || []) {
        if (!e.affiliate_code_id) continue;
        if (!earningsByCode[e.affiliate_code_id]) {
          earningsByCode[e.affiliate_code_id] = { sales: 0, earnings: 0 };
        }
        earningsByCode[e.affiliate_code_id].sales += 1;
        earningsByCode[e.affiliate_code_id].earnings += e.amount || 0;
      }

      const byUser: Record<string, LeaderboardEntry> = {};
      for (const code of codes as AffiliateCodeRow[]) {
        const profile = profiles?.find(p => p.user_id === code.user_id);
        const displayName = profile?.full_name || profile?.username || profile?.email || 'Unknown';
        const email = profile?.email || '';

        if (!byUser[code.user_id]) {
          byUser[code.user_id] = {
            user_id: code.user_id,
            display_name: displayName,
            email,
            total_sales: 0,
            total_earnings: 0,
            active_codes: 0,
            codes: [],
            tier: 'standard',
            code_ids: [],
          };
        }

        const stats = earningsByCode[code.id];
        if (stats) {
          byUser[code.user_id].total_sales += stats.sales;
          byUser[code.user_id].total_earnings += stats.earnings;
        }
        if (code.is_active) byUser[code.user_id].active_codes += 1;
        byUser[code.user_id].codes.push(code.code);
        byUser[code.user_id].code_ids.push(code.id);
        // If any code is promoter tier, mark the user as promoter
        if (code.tier === 'promoter') byUser[code.user_id].tier = 'promoter';
      }

      const sorted = Object.values(byUser).sort((a, b) => {
        if (b.total_sales !== a.total_sales) return b.total_sales - a.total_sales;
        return b.total_earnings - a.total_earnings;
      });

      const totalSales = sorted.reduce((s, e) => s + e.total_sales, 0);
      const totalEarnings = sorted.reduce((s, e) => s + e.total_earnings, 0);

      setLeaders(sorted);
      setTotalStats({ totalSales, totalEarnings, totalAffiliates: sorted.length });
    } catch (err) {
      console.error('Error fetching affiliate leaderboard:', err);
      toast({ title: 'Error loading leaderboard', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const togglePromoterTier = async (entry: LeaderboardEntry) => {
    const newTier = entry.tier === 'promoter' ? 'standard' : 'promoter';
    setUpdatingTier(entry.user_id);
    try {
      const { error } = await supabase
        .from('affiliate_codes')
        .update({ tier: newTier })
        .in('id', entry.code_ids);

      if (error) throw error;

      toast({
        title: newTier === 'promoter'
          ? `${entry.display_name} upgraded to Promoter 🌟 ($3/ticket)`
          : `${entry.display_name} set back to Standard ($1/ticket)`,
      });
      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error updating tier', variant: 'destructive' });
    } finally {
      setUpdatingTier(null);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="w-3 h-3" /> Total Affiliates
            </div>
            <div className="text-2xl font-bold">{totalStats.totalAffiliates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Ticket className="w-3 h-3" /> Total Referred Sales
            </div>
            <div className="text-2xl font-bold">{totalStats.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3 h-3" /> Total Paid Out
            </div>
            <div className="text-2xl font-bold text-primary">
              ${(totalStats.totalEarnings / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 text-muted-foreground" />
          <span>Standard — earns $1/ticket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Crown className="w-3 h-3 text-yellow-500" />
          <span>Promoter — earns $3/ticket</span>
        </div>
      </div>

      {/* Leaderboard table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" /> Affiliate Leaderboard
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Ranked by ticket sales referred. Toggle Promoter tier to grant $3/ticket.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchLeaderboard}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {leaders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground px-4">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No affiliate activity yet</p>
              <p className="text-sm mt-1">Sales will appear here once referral codes are used.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaders.map((entry, idx) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 px-4 py-3 ${entry.tier === 'promoter' ? 'bg-accent/30' : idx === 0 ? 'bg-primary/5' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {idx < 3 ? (
                      <span className="text-lg">{MEDAL_EMOJI[idx]}</span>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Name + codes */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{entry.display_name}</span>
                      {entry.tier === 'promoter' && (
                        <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0 border-primary/40 text-primary">
                          <Crown className="w-2.5 h-2.5" /> Promoter
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {entry.codes.slice(0, 3).map(code => (
                        <code key={code} className="text-xs bg-muted px-1.5 py-0 rounded font-mono">
                          {code}
                        </code>
                      ))}
                      {entry.codes.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{entry.codes.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div className="text-sm font-semibold">{entry.total_sales}</div>
                      <div className="text-xs text-muted-foreground">sales</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        ${(entry.total_earnings / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">earned</div>
                    </div>
                    <Button
                      variant={entry.tier === 'promoter' ? 'outline' : 'ghost'}
                      size="sm"
                      className={`h-7 text-xs ${entry.tier === 'promoter' ? 'border-primary/50 text-primary' : ''}`}
                      disabled={updatingTier === entry.user_id}
                      onClick={() => togglePromoterTier(entry)}
                    >
                      {updatingTier === entry.user_id ? (
                        '...'
                      ) : entry.tier === 'promoter' ? (
                        <><Crown className="w-3 h-3 mr-1" /> Promoter</>
                      ) : (
                        <><Star className="w-3 h-3 mr-1" /> Make Promoter</>
                      )}
                    </Button>
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

export default AffiliateLeaderboard;
