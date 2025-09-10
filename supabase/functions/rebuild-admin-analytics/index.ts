import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting admin analytics rebuild...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all paid tickets with creation dates
    const { data: tickets, error: ticketsError } = await supabaseClient
      .from('tickets')
      .select(`
        id,
        created_at,
        amount,
        status,
        stripe_session_id,
        user_id,
        profiles!inner(full_name, email)
      `)
      .eq('status', 'paid')
      .order('created_at', { ascending: true });

    if (ticketsError) {
      throw new Error(`Failed to fetch tickets: ${ticketsError.message}`);
    }

    console.log(`Found ${tickets?.length || 0} paid tickets`);

    // Define Tuesday event dates (this is the correct mapping logic)
    const tuesdayEvents = [
      { date: '2025-07-29', name: 'July 29 Event' },
      { date: '2025-08-05', name: 'August 5 Event' },
      { date: '2025-08-12', name: 'August 12 Event' },
      { date: '2025-08-19', name: 'August 19 Event' },
      { date: '2025-08-26', name: 'August 26 Event' },
      { date: '2025-09-02', name: 'September 2 Event' },
      { date: '2025-09-09', name: 'September 9 Event' }, // Current Tuesday
      { date: '2025-09-16', name: 'September 16 Event' },
      { date: '2025-09-23', name: 'September 23 Event' },
      { date: '2025-09-30', name: 'September 30 Event' },
      { date: '2025-10-07', name: 'October 7 Event' },
    ];

    // Function to determine which Tuesday event a ticket purchase is for
    const getEventForTicket = (ticketCreatedAt: string) => {
      const ticketDate = new Date(ticketCreatedAt);
      
      // Find the NEXT Tuesday after the ticket was bought
      // Logic: tickets bought UP TO a Tuesday are for that Tuesday
      // Everything bought AFTER that Tuesday is for the NEXT Tuesday
      
      for (let i = 0; i < tuesdayEvents.length; i++) {
        const eventDate = new Date(tuesdayEvents[i].date + 'T23:59:59Z'); // End of Tuesday
        
        if (ticketDate <= eventDate) {
          return tuesdayEvents[i];
        }
      }
      
      // If no match found, assign to the last event
      return tuesdayEvents[tuesdayEvents.length - 1];
    };

    // Organize tickets by their correct Tuesday events
    const ticketsByEvent: Record<string, any[]> = {};
    const eventStats: Record<string, any> = {};

    // Initialize all events
    tuesdayEvents.forEach(event => {
      ticketsByEvent[event.date] = [];
      eventStats[event.date] = {
        date: event.date,
        name: event.name,
        tickets_sold: 0,
        total_revenue: 0,
        unique_attendees: new Set(),
        sales: []
      };
    });

    // Process each ticket and assign to correct event
    tickets?.forEach(ticket => {
      const assignedEvent = getEventForTicket(ticket.created_at);
      const eventDate = assignedEvent.date;
      
      // Add to event statistics
      eventStats[eventDate].tickets_sold += 1;
      eventStats[eventDate].total_revenue += ticket.amount || 0;
      eventStats[eventDate].unique_attendees.add(ticket.user_id);
      
      // Add detailed sale info
      eventStats[eventDate].sales.push({
        id: ticket.id,
        user_name: ticket.profiles?.full_name || ticket.profiles?.email || 'Unknown User',
        amount: ticket.amount || 0,
        created_at: ticket.created_at,
        stripe_session_id: ticket.stripe_session_id
      });

      ticketsByEvent[eventDate].push(ticket);
    });

    // Convert unique attendees set to count
    Object.keys(eventStats).forEach(date => {
      eventStats[date].unique_attendees = eventStats[date].unique_attendees.size;
    });

    console.log("Analytics rebuild complete");
    console.log("Event breakdown:", Object.keys(eventStats).map(date => ({
      date,
      tickets: eventStats[date].tickets_sold,
      revenue: eventStats[date].total_revenue
    })));

    return new Response(JSON.stringify({
      success: true,
      message: "Admin analytics rebuilt successfully",
      event_stats: eventStats,
      total_tickets: tickets?.length || 0,
      total_revenue: tickets?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error rebuilding admin analytics:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});