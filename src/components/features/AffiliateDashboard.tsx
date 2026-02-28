// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Copy, Plus, DollarSign, Users, TrendingUp,
  Link as LinkIcon, Eye, EyeOff, Share2, Gift, Ticket
} from 'lucide-react';

interface AffiliateCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface Earning {
  id: string;
  affiliate_code_id: string;
  ticket_id: string | null;
  amount: number | null;
  created_at: string;
}

const AffiliateDashboard = () => {
  const [codes, setCodes] = useState<AffiliateCode[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAllCodes, setShowAllCodes] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: codesData, error: codesErr } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (codesErr) throw codesErr;

      const codeIds = (codesData || []).map(c => c.id);
      let earningsData: Earning[] = [];
      if (codeIds.length > 0) {
        const { data, error } = await supabase
          .from('affiliate_earnings')
          .select('*')
          .in('affiliate_code_id', codeIds)
          .order('created_at', { ascending: false });
        if (!error) earningsData = data || [];
      }

      setCodes(codesData || []);
      setEarnings(earningsData);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error loading affiliate data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data: newCode, error: genErr } = await supabase.rpc('generate_affiliate_code');
      if (genErr) throw genErr;

      const { error: insertErr } = await supabase
        .from('affiliate_codes')
        .insert({ user_id: user.id, code: newCode });
      if (insertErr) throw insertErr;

      toast({ title: `Code "${newCode}" created! 🎉` });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error creating code', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/tickets?ref=${code}`);
    toast({ title: 'Referral link copied! 📋' });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: `Code "${code}" copied!` });
  };

  const shareLink = async (code: string) => {
    const url = `${window.location.origin}/tickets?ref=${code}`;
    const text = `Get your SkateBurn ticket with my code: ${code}! 🔥`;
    if (navigator.share) {
      try { await navigator.share({ title: 'SkateBurn', text, url }); } catch {}
    } else {
      navigator.clipboard.writeText(`${text}\n\n${url}`);
      toast({ title: 'Share text copied!' });
    }
  };

  const toggleCode = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('affiliate_codes')
      .update({ is_active: !active })
      .eq('id', id);
    if (error) { toast({ title: 'Error updating code', variant: 'destructive' }); return; }
    toast({ title: active ? 'Code deactivated' : 'Code activated' });
    fetchData();
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}
    </div>
  );

  const totalEarnings = earnings.reduce((s, e) => s + (e.amount || 0), 0);
  const activeCodes = codes.filter(c => c.is_active);
  const displayCodes = showAllCodes ? codes : codes.slice(0, 3);

  // Earnings per code map
  const earningsByCode: Record<string, number> = {};
  const usesByCode: Record<string, number> = {};
  for (const e of earnings) {
    earningsByCode[e.affiliate_code_id] = (earningsByCode[e.affiliate_code_id] || 0) + (e.amount || 0);
    usesByCode[e.affiliate_code_id] = (usesByCode[e.affiliate_code_id] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Affiliate Dashboard</h1>
          <p className="text-muted-foreground text-sm">Share your link → earn $1 per ticket sold</p>
        </div>
        <Button onClick={generateCode} disabled={generating} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {generating ? 'Creating...' : 'New Code'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-primary">${(totalEarnings / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Ticket className="w-3 h-3" /> Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{earnings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> Active
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{activeCodes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Codes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4" /> Your Referral Links
            </CardTitle>
            {codes.length > 3 && (
              <Button variant="ghost" size="sm" onClick={() => setShowAllCodes(!showAllCodes)}>
                {showAllCodes ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {showAllCodes ? 'Show less' : `All (${codes.length})`}
              </Button>
            )}
          </div>
          <CardDescription className="text-xs">Share your link — when someone buys a ticket using it, you earn $1.</CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium mb-1">No codes yet</p>
              <p className="text-sm mb-4">Create your first referral code to start earning!</p>
              <Button onClick={generateCode} disabled={generating} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Create Code
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayCodes.map(c => (
                <div key={c.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <code className="text-base font-mono font-bold bg-muted px-2 py-0.5 rounded tracking-widest">
                        {c.code}
                      </code>
                      <Badge variant={c.is_active ? 'default' : 'secondary'} className="text-xs">
                        {c.is_active ? 'Active' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{usesByCode[c.id] || 0} sales</span>
                      <span>·</span>
                      <span className="text-primary font-medium">${((earningsByCode[c.id] || 0) / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shareable link preview */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1 font-mono truncate">
                    {window.location.origin}/tickets?ref={c.code}
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => copyCode(c.code)}>
                      <Copy className="h-3 w-3 mr-1" /> Code
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => copyLink(c.code)}>
                      <LinkIcon className="h-3 w-3 mr-1" /> Link
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => shareLink(c.code)}>
                      <Share2 className="h-3 w-3 mr-1" /> Share
                    </Button>
                    <Button
                      variant={c.is_active ? 'destructive' : 'default'}
                      size="sm"
                      className="h-7 text-xs ml-auto"
                      onClick={() => toggleCode(c.id, c.is_active)}
                    >
                      {c.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Recent Sales
          </CardTitle>
          <CardDescription className="text-xs">Ticket sales attributed to your referral codes</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No sales yet — share your link!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {earnings.slice(0, 20).map(e => {
                const code = codes.find(c => c.id === e.affiliate_code_id);
                return (
                  <div key={e.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 text-sm">
                    <div>
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded mr-2">{code?.code || '—'}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">+${((e.amount || 0) / 100).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateDashboard;
