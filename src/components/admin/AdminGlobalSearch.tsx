import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Ticket, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/forms/input';

interface SearchResult {
  id: string;
  type: 'user' | 'ticket' | 'order';
  title: string;
  subtitle: string;
  href?: string;
}

export const AdminGlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const term = q.toLowerCase();

      const [usersRes, ticketsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name, email, username, role')
          .or(`full_name.ilike.%${term}%,email.ilike.%${term}%,username.ilike.%${term}%`)
          .limit(5),
        supabase
          .from('tickets')
          .select('id, user_id, amount, status, created_at, stripe_session_id, stripe_payment_intent_id, qr_code')
          .or(`id.ilike.%${term}%,stripe_session_id.ilike.%${term}%,stripe_payment_intent_id.ilike.%${term}%,qr_code.ilike.%${term}%`)
          .limit(5),
      ]);

      const combined: SearchResult[] = [];

      (usersRes.data || []).forEach((u) => {
        combined.push({
          id: u.user_id,
          type: 'user',
          title: u.full_name || u.username || 'Unknown User',
          subtitle: u.email || `Role: ${u.role}`,
          href: '/admin/members',
        });
      });

      (ticketsRes.data || []).forEach((t) => {
        const isOrder = t.stripe_session_id || t.stripe_payment_intent_id;
        combined.push({
          id: t.id,
          type: isOrder ? 'order' : 'ticket',
          title: isOrder ? `Order — $${(t.amount / 100).toFixed(2)}` : `Ticket #${t.id.slice(0, 8)}`,
          subtitle: `Status: ${t.status} · ${new Date(t.created_at).toLocaleDateString()}`,
          href: '/admin/analytics',
        });
      });

      setResults(combined);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 300);
    return () => clearTimeout(timeout);
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const TypeIcon = ({ type }: { type: SearchResult['type'] }) => {
    if (type === 'user') return <User className="w-3.5 h-3.5 text-blue-400" />;
    if (type === 'order') return <DollarSign className="w-3.5 h-3.5 text-green-400" />;
    return <Ticket className="w-3.5 h-3.5 text-orange-400" />;
  };

  const typeLabel: Record<SearchResult['type'], string> = {
    user: 'User',
    ticket: 'Ticket',
    order: 'Order',
  };

  const typeColor: Record<SearchResult['type'], string> = {
    user: 'bg-blue-900/50 text-blue-300',
    ticket: 'bg-orange-900/50 text-orange-300',
    order: 'bg-green-900/50 text-green-300',
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm min-w-[140px] sm:min-w-[200px]"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="hidden sm:inline text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">⌘K</kbd>
        </button>
      )}

      {/* Expanded search input */}
      {open && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, tickets, orders…"
            className="h-9 w-[260px] sm:w-[320px] rounded-lg bg-gray-800 border border-primary/60 text-white placeholder-gray-500 pl-9 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />
          ) : (
            <button
              onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Results dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute top-full mt-2 right-0 w-[320px] sm:w-[400px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-[200] overflow-hidden">
          {results.length === 0 && !loading && (
            <p className="text-sm text-gray-500 text-center py-6">No results for "{query}"</p>
          )}
          {results.length > 0 && (
            <ul className="py-2 max-h-[360px] overflow-y-auto">
              {results.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                    onClick={() => {
                      if (r.href) navigate(r.href);
                      setOpen(false);
                      setQuery('');
                      setResults([]);
                    }}
                  >
                    <div className="p-1.5 rounded-md bg-gray-800 shrink-0">
                      <TypeIcon type={r.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${typeColor[r.type]}`}>
                      {typeLabel[r.type]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-gray-800 px-4 py-2 flex gap-3">
            {(['user','ticket','order'] as const).map((t) => (
              <span key={t} className="flex items-center gap-1 text-[10px] text-gray-500">
                <TypeIcon type={t} /> {typeLabel[t]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
