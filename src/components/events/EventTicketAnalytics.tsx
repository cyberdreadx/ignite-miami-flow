import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Ticket, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventData {
  id: string;
  title: string;
  subtitle?: string;
  start_at?: string;
  location: string;
  time: string;
  is_active: boolean;
}

interface TicketPurchase {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  stripe_session_id: string | null;
  valid_until: string | null;
  used_at: string | null;
  used_by: string | null;
  user_email: string;
  user_name: string;
  event_id?: string;
  event_title?: string;
}

interface EventTicketStats {
  event_id?: string;
  event_title: string;
  total_tickets: number;
  paid_tickets: number;
  total_revenue: number;
  used_tickets: number;
  tickets: TicketPurchase[];
}

const EventTicketAnalytics = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventTicketStats, setEventTicketStats] = useState<EventTicketStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEventsAndTickets();
  }, []);

  const fetchEventsAndTickets = async () => {
    try {
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      }

      // Fetch all tickets with user info
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          user_id,
          amount,
          status,
          created_at,
          stripe_session_id,
          valid_until,
          used_at,
          used_by,
          event_id
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        return;
      }

      // Fetch user profiles
      const userIds = [...new Set((ticketsData || []).map(ticket => ticket.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Map tickets with user data
      const mappedTickets = (ticketsData || []).map((ticket: any) => {
        const profile = profilesData?.find(p => p.user_id === ticket.user_id);
        return {
          ...ticket,
          user_email: profile?.email || 'Unknown',
          user_name: profile?.full_name || profile?.email || 'Unknown User',
        };
      });

      // Create event stats
      const eventStats: EventTicketStats[] = [];
      
      // Add stats for each event
      (eventsData || []).forEach(event => {
        const eventTickets = mappedTickets.filter(t => t.event_id === event.id);
        const paidTickets = eventTickets.filter(t => t.status === 'paid');
        const usedTickets = eventTickets.filter(t => t.used_at);
        
        eventStats.push({
          event_id: event.id,
          event_title: event.title,
          total_tickets: eventTickets.length,
          paid_tickets: paidTickets.length,
          total_revenue: paidTickets.reduce((sum, t) => sum + (t.amount || 0), 0),
          used_tickets: usedTickets.length,
          tickets: eventTickets
        });
      });

      // Add stats for tickets without event (legacy tickets)
      const ticketsWithoutEvent = mappedTickets.filter(t => !t.event_id);
      if (ticketsWithoutEvent.length > 0) {
        const paidTickets = ticketsWithoutEvent.filter(t => t.status === 'paid');
        const usedTickets = ticketsWithoutEvent.filter(t => t.used_at);
        
        eventStats.push({
          event_title: 'General Admission (Legacy)',
          total_tickets: ticketsWithoutEvent.length,
          paid_tickets: paidTickets.length,
          total_revenue: paidTickets.reduce((sum, t) => sum + (t.amount || 0), 0),
          used_tickets: usedTickets.length,
          tickets: ticketsWithoutEvent
        });
      }

      setEvents(eventsData || []);
      setEventTicketStats(eventStats);
    } catch (error) {
      console.error('Error in fetchEventsAndTickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnuseTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          used_at: null,
          used_by: null
        })
        .eq('id', ticketId);

      if (error) {
        toast({
          title: 'Error resetting ticket',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        fetchEventsAndTickets(); // Refresh the data
        toast({
          title: 'Ticket Reset Successfully ✅',
          description: 'The ticket has been marked as unused and is valid again.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error resetting ticket',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading ticket analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {events.filter(e => e.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventTicketStats.reduce((sum, event) => sum + event.paid_tickets, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {eventTicketStats.reduce((sum, event) => sum + event.used_tickets, 0)} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(eventTicketStats.reduce((sum, event) => sum + event.total_revenue, 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Event</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${eventTicketStats.length > 0 ? ((eventTicketStats.reduce((sum, event) => sum + event.total_revenue, 0) / eventTicketStats.length) / 100).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Revenue per event</p>
          </CardContent>
        </Card>
      </div>

      {/* Event-by-Event Breakdown */}
      {eventTicketStats.map((eventStat, index) => (
        <Card key={eventStat.event_id || `legacy-${index}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {eventStat.event_title}
                  <Badge variant="secondary">{eventStat.paid_tickets} tickets</Badge>
                </CardTitle>
                <CardDescription>
                  ${(eventStat.total_revenue / 100).toFixed(2)} revenue • {eventStat.used_tickets} tickets used
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{eventStat.paid_tickets}</div>
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {eventStat.tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tickets sold for this event yet</p>
                </div>
              ) : (
                eventStat.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg space-y-3 lg:space-y-0"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>
                          {ticket.user_name?.charAt(0) || ticket.user_email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-medium truncate">{ticket.user_name}</p>
                          <Badge 
                            variant={ticket.status === 'paid' ? 'default' : 'outline'}
                            className={`text-xs capitalize ${
                              ticket.status === 'paid' ? 'bg-green-100 text-green-800' :
                              ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {ticket.status}
                          </Badge>
                          {ticket.used_at && (
                            <Badge variant="secondary" className="text-xs">
                              Used
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{ticket.user_email}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>${(ticket.amount / 100).toFixed(2)}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                          {ticket.valid_until && (
                            <>
                              <span>•</span>
                              <span>Valid until {new Date(ticket.valid_until).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        {ticket.stripe_session_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Session: {ticket.stripe_session_id.slice(-8)}
                          </p>
                        )}
                        {ticket.used_at && ticket.used_by && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Used by {ticket.used_by} on {new Date(ticket.used_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {ticket.used_at && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnuseTicket(ticket.id)}
                          className="flex items-center gap-1"
                        >
                          Reset Ticket
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {eventTicketStats.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events or Tickets Yet</h3>
            <p className="text-muted-foreground">
              Create events and start selling tickets to see analytics here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventTicketAnalytics;