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
    
    // Since today is Tuesday September 9, 2025, let's use that as our reference
    const currentTuesday = new Date('2025-09-09'); // Today's Tuesday
    
    // Add past 6 Tuesdays
    for (let i = 6; i >= 1; i--) {
      const pastTuesday = new Date(currentTuesday);
      pastTuesday.setDate(currentTuesday.getDate() - (i * 7));
      tuesdays.push(format(pastTuesday, 'yyyy-MM-dd'));
    }
    
    // Add current Tuesday (September 9, 2025)
    tuesdays.push(format(currentTuesday, 'yyyy-MM-dd'));
    
    // Add next 4 Tuesdays
    for (let i = 1; i <= 4; i++) {
      const futureTuesday = new Date(currentTuesday);
      futureTuesday.setDate(currentTuesday.getDate() + (i * 7));
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
    const today = new Date('2025-09-09'); // Current Tuesday
    const isToday = format(date, 'yyyy-MM-dd') === '2025-09-09';
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
        <CardContent className="p-3 md:p-6">
          <Tabs defaultValue={eventData[6]?.date || eventData[0]?.date} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-1 h-auto p-1 overflow-x-auto">
              {eventData.map((event) => (
                <TabsTrigger 
                  key={event.date} 
                  value={event.date}
                  className="text-[10px] md:text-xs p-1 md:p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap min-w-0"
                >
                  {formatTuesdayLabel(event.date)}
                </TabsTrigger>
              ))}
            </TabsList>

            {eventData.map((event) => (
              <TabsContent key={event.date} value={event.date} className="mt-3 md:mt-4">
                <div className="space-y-3 md:space-y-4">
                  {/* Stats for this Tuesday */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    <Card>
                      <CardHeader className="pb-1 md:pb-2 px-2 md:px-6">
                        <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                          <Ticket className="h-3 w-3 md:h-4 md:w-4" />
                          Tickets
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-2 md:px-6">
                        <div className="text-lg md:text-2xl font-bold">{event.tickets_sold}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-1 md:pb-2 px-2 md:px-6">
                        <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                          <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                          Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-2 md:px-6">
                        <div className="text-lg md:text-2xl font-bold">${(event.revenue / 100).toFixed(0)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-1 md:pb-2 px-2 md:px-6">
                        <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                          <Users className="h-3 w-3 md:h-4 md:w-4" />
                          Attendees
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-2 md:px-6">
                        <div className="text-lg md:text-2xl font-bold">{event.users_count}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-1 md:pb-2 px-2 md:px-6">
                        <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                          <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                          Avg. Price
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-2 md:px-6">
                        <div className="text-lg md:text-2xl font-bold">
                          ${event.tickets_sold > 0 ? ((event.revenue / 100) / event.tickets_sold).toFixed(0) : '0'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Ticket Sales List */}
                  {ticketSales[event.date] && ticketSales[event.date].length > 0 ? (
                    <Card>
                      <CardHeader className="px-3 md:px-6">
                        <CardTitle className="text-base md:text-lg">Ticket Sales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {ticketSales[event.date].map((sale) => (
                            <div key={sale.id} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <div className="font-medium text-sm">{sale.user_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(sale.created_at), 'h:mm a')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-sm">${(sale.amount / 100).toFixed(2)}</div>
                                <Badge variant="outline" className="text-[10px]">
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
                      <CardContent className="p-4 md:p-6 text-center text-muted-foreground text-sm">
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