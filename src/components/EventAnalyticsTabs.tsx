import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { 
  Calendar,
  Users,
  DollarSign,
  Ticket,
  TrendingUp
} from 'lucide-react';

interface EventData {
  date: string;
  tickets_sold: number;
  revenue: number;
  users_count: number;
}

interface TicketSale {
  id: string;
  user_name: string;
  amount: number;
  created_at: string;
  status: string;
}

export const EventAnalyticsTabs: React.FC = () => {
  const { toast } = useToast();
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [ticketSales, setTicketSales] = useState<Record<string, TicketSale[]>>({});
  const [loading, setLoading] = useState(true);

  // Generate the last 8 Tuesdays + next 4 Tuesdays
  const generateTuesdays = () => {
    const tuesdays = [];
    const today = new Date();
    
    // Find the most recent Tuesday
    let tuesday = new Date(today);
    const dayOfWeek = tuesday.getDay();
    const daysFromTuesday = dayOfWeek === 2 ? 0 : dayOfWeek > 2 ? 7 - dayOfWeek + 2 : 2 - dayOfWeek;
    tuesday.setDate(tuesday.getDate() - (dayOfWeek === 2 ? 0 : dayOfWeek > 2 ? dayOfWeek - 2 : dayOfWeek + 5));
    
    // Add past 6 Tuesdays
    for (let i = 6; i >= 1; i--) {
      const pastTuesday = new Date(tuesday);
      pastTuesday.setDate(tuesday.getDate() - (i * 7));
      tuesdays.push(format(pastTuesday, 'yyyy-MM-dd'));
    }
    
    // Add current Tuesday
    tuesdays.push(format(tuesday, 'yyyy-MM-dd'));
    
    // Add next 4 Tuesdays
    for (let i = 1; i <= 4; i++) {
      const futureTuesday = new Date(tuesday);
      futureTuesday.setDate(tuesday.getDate() + (i * 7));
      tuesdays.push(format(futureTuesday, 'yyyy-MM-dd'));
    }
    
    return tuesdays;
  };

  const fetchEventData = async () => {
    try {
      const tuesdays = generateTuesdays();
      const eventDataPromises = tuesdays.map(async (dateStr) => {
        const startDate = new Date(dateStr + 'T00:00:00Z');
        const endDate = new Date(dateStr + 'T23:59:59Z');
        
        // Get tickets for this specific date
        const { data: tickets } = await supabase
          .from('tickets')
          .select('id, amount, status, created_at, user_id')
          .eq('status', 'paid')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        // Get user profiles separately for tickets
        const userIds = [...new Set(tickets?.map(t => t.user_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const ticketsWithUserNames = tickets?.map(ticket => {
          const profile = profiles?.find(p => p.user_id === ticket.user_id);
          return {
            id: ticket.id,
            user_name: profile?.full_name || profile?.email || 'Unknown User',
            amount: ticket.amount || 0,
            created_at: ticket.created_at,
            status: ticket.status
          };
        }) || [];

        return {
          date: dateStr,
          tickets_sold: tickets?.length || 0,
          revenue: tickets?.reduce((sum, ticket) => sum + (ticket.amount || 0), 0) || 0,
          users_count: new Set(tickets?.map(t => t.user_id)).size || 0,
          sales: ticketsWithUserNames
        };
      });

      const results = await Promise.all(eventDataPromises);
      setEventData(results);
      
      // Organize ticket sales by date
      const salesByDate: Record<string, TicketSale[]> = {};
      results.forEach(result => {
        salesByDate[result.date] = result.sales || [];
      });
      setTicketSales(salesByDate);
      
    } catch (error) {
      console.error('Error fetching event data:', error);
      toast({
        title: "Error",
        description: "Failed to load event analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, []);

  const formatTuesdayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    const isPast = date < today;
    const isFuture = date > today;
    
    let label = format(date, 'MMM d');
    if (isToday) label += ' (Today)';
    else if (isPast) label += ' (Past)';
    else if (isFuture) label += ' (Future)';
    
    return label;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading event analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tuesday Events Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={eventData[6]?.date || eventData[0]?.date} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-1 h-auto p-1">
              {eventData.map((event) => (
                <TabsTrigger 
                  key={event.date} 
                  value={event.date}
                  className="text-xs p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {formatTuesdayLabel(event.date)}
                </TabsTrigger>
              ))}
            </TabsList>

            {eventData.map((event) => (
              <TabsContent key={event.date} value={event.date} className="mt-4">
                <div className="space-y-4">
                  {/* Stats for this Tuesday */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          Tickets
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{event.tickets_sold}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${(event.revenue / 100).toFixed(0)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Attendees
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{event.users_count}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Avg. Price
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${event.tickets_sold > 0 ? ((event.revenue / 100) / event.tickets_sold).toFixed(0) : '0'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Ticket Sales List */}
                  {ticketSales[event.date] && ticketSales[event.date].length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Ticket Sales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {ticketSales[event.date].map((sale) => (
                            <div key={sale.id} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <div className="font-medium">{sale.user_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(sale.created_at), 'h:mm a')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${(sale.amount / 100).toFixed(2)}</div>
                                <Badge variant="outline" className="text-xs">
                                  {sale.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        No ticket sales for this date
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};