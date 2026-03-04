import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw, Trophy, DollarSign, Ticket, TrendingUp,
  Star, Crown, CheckCircle2, Clock, ChevronDown, ChevronUp,
  Banknote
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlays/dialog';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { formatDistanceToNow } from 'date-fns';

interface AffiliateCodeRow {
  id: string;
  code: string;
  user_id: string;
  is_active: boolean | null;
  tier: string;
}

interface Payout {
  id: string;
  amount: number;
  note: string | null;
  created_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  email: string;
  total_sales: number;
  total_earned: number;   // in cents — all time
  total_paid_out: number; // in cents — sum of payouts
  outstanding: number;    // in cents — earned - paid out
  active_codes: number;
  codes: string[];
  code_ids: string[];
  tier: 'standard' | 'promoter';
  payouts: Payout[];
}

const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

const AffiliateLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [updatingTier, setUpdatingTier] = useState<string | null>(null);
  const [payoutDialog, setPayoutDialog] = useState<LeaderboardEntry | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [totalStats, setTotalStats] = useState({ totalSales: 0, totalEarned: 0, totalPaidOut: 0, totalOutstanding: 0, totalAffiliates: 0 });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const [codesRes, earningsRes, payoutsRes] = await Promise.all([
        supabase.from('affiliate_codes').select('id, code, user_id, is_active, tier'),
        supabase.from('affiliate_earnings').select('affiliate_code_id, amount'),
        supabase.from('affiliate_payouts').select('id, user_id, amount, note, created_at').order('created_at', { ascending: false }),
      ]);

      if (codesRes.error) throw codesRes.error;
      if (earningsRes.error) throw earningsRes.error;
      if (payoutsRes.error) throw payoutsRes.error;

      const codes = (codesRes.data || []) as AffiliateCodeRow[];
      const earnings = earningsRes.data || [];
      const payouts = payoutsRes.data || [];

      if (codes.length === 0) { setLeaders([]); setLoading(false); return; }

      const userIds = [...new Set(codes.map(c => c.user_id))];
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, email')
        .in('user_id', userIds);
      if (profilesErr) throw profilesErr;

      // earnings per code
      const earningsByCode: Record<string, { sales: number; earned: number }> = {};
      for (const e of earnings) {
        if (!e.affiliate_code_id) continue;
        if (!earningsByCode[e.affiliate_code_id]) earningsByCode[e.affiliate_code_id] = { sales: 0, earned: 0 };
        earningsByCode[e.affiliate_code_id].sales += 1;
        earningsByCode[e.affiliate_code_id].earned += e.amount || 0;
      }

      // payouts per user
      const payoutsByUser: Record<string, { total: number; records: Payout[] }> = {};
      for (const p of payouts) {
        if (!payoutsByUser[p.user_id]) payoutsByUser[p.user_id] = { total: 0, records: [] };
        payoutsByUser[p.user_id].total += p.amount || 0;
        payoutsByUser[p.user_id].records.push({ id: p.id, amount: p.amount, note: p.note, created_at: p.created_at });
      }

      const byUser: Record<string, LeaderboardEntry> = {};
      for (const code of codes) {
        const profile = profiles?.find(p => p.user_id === code.user_id);
        const displayName = profile?.full_name || profile?.username || profile?.email || 'Unknown';
        const email = profile?.email || '';

        if (!byUser[code.user_id]) {
          byUser[code.user_id] = {
            user_id: code.user_id,
            display_name: displayName,
            email,
            total_sales: 0,
            total_earned: 0,
            total_paid_out: payoutsByUser[code.user_id]?.total || 0,
            outstanding: 0,
            active_codes: 0,
            codes: [],
            code_ids: [],
            tier: 'standard',
            payouts: payoutsByUser[code.user_id]?.records || [],
          };
        }
        const stats = earningsByCode[code.id];
        if (stats) {
          byUser[code.user_id].total_sales += stats.sales;
          byUser[code.user_id].total_earned += stats.earned;
        }
        if (code.is_active) byUser[code.user_id].active_codes += 1;
        byUser[code.user_id].codes.push(code.code);
        byUser[code.user_id].code_ids.push(code.id);
        if (code.tier === 'promoter') byUser[code.user_id].tier = 'promoter';
      }

      // compute outstanding after all codes processed
      for (const entry of Object.values(byUser)) {
        entry.outstanding = Math.max(0, entry.total_earned - entry.total_paid_out);
      }

      const sorted = Object.values(byUser).sort((a, b) =>
        b.outstanding !== a.outstanding ? b.outstanding - a.outstanding : b.total_sales - a.total_sales
      );

      setLeaders(sorted);
      setTotalStats({
        totalAffiliates: sorted.length,
        totalSales: sorted.reduce((s, e) => s + e.total_sales, 0),
        totalEarned: sorted.reduce((s, e) => s + e.total_earned, 0),
        totalPaidOut: sorted.reduce((s, e) => s + e.total_paid_out, 0),
        totalOutstanding: sorted.reduce((s, e) => s + e.outstanding, 0),
      });
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      toast({ title: 'Error loading leaderboard', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const togglePromoterTier = async (entry: LeaderboardEntry) => {
    const newTier = entry.tier === 'promoter' ? 'standard' : 'promoter';
    setUpdatingTier(entry.user_id);
    try {
      const { error } = await supabase.from('affiliate_codes').update({ tier: newTier }).in('id', entry.code_ids);
      if (error) throw error;
      toast({ title: newTier === 'promoter' ? `${entry.display_name} upgraded to Promoter 🌟 ($3/ticket)` : `${entry.display_name} set to Standard ($1/ticket)` });
      fetchLeaderboard();
    } catch (err) {
      toast({ title: 'Error updating tier', variant: 'destructive' });
    } finally {
      setUpdatingTier(null);
    }
  };

  const openPayoutDialog = (entry: LeaderboardEntry) => {
    setPayoutDialog(entry);
    setPayoutAmount((entry.outstanding / 100).toFixed(2));
    setPayoutNote('');
  };

  const submitPayout = async () => {
    if (!payoutDialog || !user) return;
    const amountCents = Math.round(parseFloat(payoutAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast({ title: 'Enter a valid amount', variant: 'destructive' });
      return;
    }
    setSubmittingPayout(true);
    try {
      const { error } = await supabase.from('affiliate_payouts').insert({
        user_id: payoutDialog.user_id,
        amount: amountCents,
        note: payoutNote.trim() || null,
        paid_by: user.id,
      });
      if (error) throw error;
      toast({ title: `Payout of $${(amountCents / 100).toFixed(2)} recorded for ${payoutDialog.display_name} ✅` });
      setPayoutDialog(null);
      fetchLeaderboard();
    } catch (err) {
      toast({ title: 'Error recording payout', variant: 'destructive' });
    } finally {
      setSubmittingPayout(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><TrendingUp className="w-3 h-3" /> Affiliates</div>
            <div className="text-2xl font-bold">{totalStats.totalAffiliates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Ticket className="w-3 h-3" /> Referred Sales</div>
            <div className="text-2xl font-bold">{totalStats.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><DollarSign className="w-3 h-3" /> Total Earned</div>
            <div className="text-2xl font-bold text-primary">${(totalStats.totalEarned / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Clock className="w-3 h-3" /> Outstanding</div>
            <div className={`text-2xl font-bold ${totalStats.totalOutstanding > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              ${(totalStats.totalOutstanding / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1.5"><Star className="w-3 h-3" /> Standard — $1/ticket</div>
        <div className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-primary" /> Promoter — $3/ticket</div>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" /> Affiliate Leaderboard
              </CardTitle>
              <CardDescription className="text-xs mt-1">Sorted by outstanding balance. Click a row to see payout history.</CardDescription>
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
                <div key={entry.user_id}>
                  {/* Main row */}
                  <div
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors ${entry.outstanding > 0 ? 'bg-muted/40' : ''}`}
                    onClick={() => setExpandedUser(expandedUser === entry.user_id ? null : entry.user_id)}
                  >
                    {/* Rank */}
                    <div className="w-7 text-center shrink-0">
                      {idx < 3
                        ? <span className="text-base">{MEDAL_EMOJI[idx]}</span>
                        : <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-sm truncate">{entry.display_name}</span>
                        {entry.tier === 'promoter' && (
                          <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0 border-primary/40 text-primary">
                            <Crown className="w-2.5 h-2.5" /> Promoter
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {entry.codes.slice(0, 3).map(code => (
                          <code key={code} className="text-xs bg-muted px-1.5 rounded font-mono">{code}</code>
                        ))}
                        {entry.codes.length > 3 && <span className="text-xs text-muted-foreground">+{entry.codes.length - 3}</span>}
                      </div>
                    </div>

                    {/* Balance columns */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <div className="text-xs text-muted-foreground">sales</div>
                        <div className="text-sm font-semibold">{entry.total_sales}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">earned</div>
                        <div className="text-sm font-semibold text-primary">${(entry.total_earned / 100).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">paid out</div>
                        <div className="text-sm font-semibold text-muted-foreground">${(entry.total_paid_out / 100).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">outstanding</div>
                        <div className={`text-sm font-bold ${entry.outstanding > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          ${(entry.outstanding / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <Button
                        variant={entry.outstanding > 0 ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        disabled={entry.outstanding === 0}
                        onClick={() => openPayoutDialog(entry)}
                      >
                        <Banknote className="w-3 h-3 mr-1" />
                        <span className="hidden xs:inline">Pay Out</span>
                      </Button>
                      <Button
                        variant={entry.tier === 'promoter' ? 'default' : 'outline'}
                        size="sm"
                        className={`h-7 text-xs gap-1 ${entry.tier === 'promoter' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                        disabled={updatingTier === entry.user_id}
                        title={entry.tier === 'promoter' ? 'Promoter ($3/ticket) — click to demote' : 'Standard ($1/ticket) — click to promote'}
                        onClick={() => togglePromoterTier(entry)}
                      >
                        {updatingTier === entry.user_id
                          ? <RefreshCw className="w-3 h-3 animate-spin" />
                          : entry.tier === 'promoter'
                            ? <><Crown className="w-3 h-3" /><span className="hidden sm:inline">Promoter</span></>
                            : <><Star className="w-3 h-3" /><span className="hidden sm:inline">Standard</span></>
                        }
                      </Button>
                      {expandedUser === entry.user_id
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Mobile balance row */}
                  <div className="sm:hidden flex items-center gap-4 px-4 pb-2 text-xs">
                    <span className="text-muted-foreground">{entry.total_sales} sales</span>
                    <span className="text-primary font-medium">${(entry.total_earned / 100).toFixed(2)} earned</span>
                    <span className="text-muted-foreground">${(entry.total_paid_out / 100).toFixed(2)} paid</span>
                    <span className={`font-bold ${entry.outstanding > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      ${(entry.outstanding / 100).toFixed(2)} owed
                    </span>
                  </div>

                  {/* Expanded payout history */}
                  {expandedUser === entry.user_id && (
                    <div className="bg-muted/20 border-t border-border/50 px-4 py-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Payout History</p>
                      {entry.payouts.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No payouts recorded yet.</p>
                      ) : (
                        entry.payouts.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                              <div>
                                <span className="font-medium text-primary">${(p.amount / 100).toFixed(2)}</span>
                                {p.note && <span className="text-muted-foreground ml-2 text-xs">{p.note}</span>}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout dialog */}
      <Dialog open={!!payoutDialog} onOpenChange={open => !open && setPayoutDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-4 h-4" /> Record Payout
            </DialogTitle>
            <DialogDescription>
              Mark earnings as paid out for <strong>{payoutDialog?.display_name}</strong>.
              Outstanding balance: <strong className="text-destructive">${((payoutDialog?.outstanding ?? 0) / 100).toFixed(2)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={payoutAmount}
                onChange={e => setPayoutAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                value={payoutNote}
                onChange={e => setPayoutNote(e.target.value)}
                placeholder="e.g. Venmo payment, cash at event..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialog(null)}>Cancel</Button>
            <Button onClick={submitPayout} disabled={submittingPayout}>
              {submittingPayout ? 'Saving...' : 'Record Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliateLeaderboard;
