import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log(`Checking for missing tickets for user: ${user.email}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase admin client for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      console.log(`No Stripe customer found for ${user.email}, searching checkout sessions by metadata`);
      
      // If no customer found, search checkout sessions by user metadata instead
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
      });
      
      // Filter sessions that have the user's ID in metadata or email
      const userSessions = sessions.data.filter(session => 
        session.metadata?.user_id === user.id || 
        session.customer_email === user.email ||
        session.metadata?.user_email === user.email
      );
      
      console.log(`Found ${userSessions.length} sessions by metadata/email for user ${user.email}`);
      
      if (userSessions.length === 0) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: "No payments found for your account",
          ticketsCreated: 0 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Process these sessions
      const createdTickets = [];
      let ticketsCreated = 0;

      for (const session of userSessions) {
        if (session.payment_status === 'paid' && session.mode === 'payment') {
          console.log(`Checking session: ${session.id}, amount: ${session.amount_total}`);

          // Check if ticket already exists
          const { data: existingTicket } = await supabase
            .from('tickets')
            .select('id')
            .eq('stripe_session_id', session.id)
            .single();

          if (!existingTicket) {
            console.log(`Creating missing ticket for session: ${session.id}`);

            // Get user profile for proper name display
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', user.id)
              .single();

            const userName = profile?.full_name || profile?.email || user.email;

            // Generate QR code token
            const qrToken = `QR_${Math.random().toString(36).substr(2, 8).toUpperCase()}_${Date.now()}`;
            
            // Get the current active event to determine validity period
            const { data: event } = await supabase
              .from('events')
              .select('*')
              .eq('is_active', true)
              .single();

            // Calculate validity: 2 days after the next Tuesday event
            const validUntil = new Date();
            const dayOfWeek = validUntil.getDay(); // 0 = Sunday, 1 = Monday, ..., 2 = Tuesday
            const daysUntilTuesday = dayOfWeek <= 2 ? (2 - dayOfWeek) : (9 - dayOfWeek); // Next Tuesday
            validUntil.setDate(validUntil.getDate() + daysUntilTuesday + 2); // Event date + 2 days
            validUntil.setHours(23, 59, 59, 999); // End of day

            const qrData = {
              type: "ticket",
              user_id: user.id,
              user_name: userName,
              token: qrToken,
              amount: session.amount_total,
              valid_until: validUntil.toISOString()
            };

            // Create the ticket
            const { data: ticket, error: ticketError } = await supabase
              .from('tickets')
              .insert({
                user_id: user.id,
                stripe_session_id: session.id,
                amount: session.amount_total,
                currency: session.currency,
                status: 'paid',
                qr_code_token: qrToken,
                qr_code_data: JSON.stringify(qrData),
                valid_until: validUntil.toISOString(),
                created_at: new Date(session.created * 1000).toISOString(),
              })
              .select()
              .single();

            if (ticketError) {
              console.error(`Error creating ticket for session ${session.id}:`, ticketError);
            } else {
              console.log(`Successfully created ticket: ${ticket.id}`);
              createdTickets.push({
                sessionId: session.id,
                ticketId: ticket.id,
                amount: session.amount_total
              });
              ticketsCreated++;
            }
          } else {
            console.log(`Ticket already exists for session: ${session.id}`);
          }
        }
      }

      console.log(`Recovery complete. Created ${ticketsCreated} tickets`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: ticketsCreated > 0 
          ? `Found and created ${ticketsCreated} missing ticket(s)!` 
          : "No missing tickets found",
        ticketsCreated,
        createdTickets
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Original customer-based logic continues here
    const customerId = customers.data[0].id;
    console.log(`Found Stripe customer: ${customerId}`);

    // Get all successful checkout sessions for this customer
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
    });

    console.log(`Found ${sessions.data.length} checkout sessions`);

    const createdTickets = [];
    let ticketsCreated = 0;

    for (const session of sessions.data) {
      if (session.payment_status === 'paid' && session.mode === 'payment') {
        console.log(`Checking session: ${session.id}, amount: ${session.amount_total}`);

        // Check if ticket already exists
        const { data: existingTicket } = await supabase
          .from('tickets')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single();

        if (!existingTicket) {
          console.log(`Creating missing ticket for session: ${session.id}`);

          // Get user profile for proper name display
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', user.id)
            .single();

          const userName = profile?.full_name || profile?.email || user.email;

          // Generate QR code token
          const qrToken = `QR_${Math.random().toString(36).substr(2, 8).toUpperCase()}_${Date.now()}`;
          
          // Get the current active event to determine validity period
          const { data: event } = await supabase
            .from('events')
            .select('*')
            .eq('is_active', true)
            .single();

          // Calculate validity: 2 days after the next Tuesday event
          const validUntil = new Date();
          const dayOfWeek = validUntil.getDay(); // 0 = Sunday, 1 = Monday, ..., 2 = Tuesday
          const daysUntilTuesday = dayOfWeek <= 2 ? (2 - dayOfWeek) : (9 - dayOfWeek); // Next Tuesday
          validUntil.setDate(validUntil.getDate() + daysUntilTuesday + 2); // Event date + 2 days
          validUntil.setHours(23, 59, 59, 999); // End of day

          const qrData = {
            type: "ticket",
            user_id: user.id,
            user_name: userName,
            token: qrToken,
            amount: session.amount_total,
            valid_until: validUntil.toISOString()
          };

          // Create the ticket
          const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .insert({
              user_id: user.id,
              stripe_session_id: session.id,
              amount: session.amount_total,
              currency: session.currency,
              status: 'paid',
              qr_code_token: qrToken,
              qr_code_data: JSON.stringify(qrData),
              valid_until: validUntil.toISOString(),
              created_at: new Date(session.created * 1000).toISOString(),
            })
            .select()
            .single();

          if (ticketError) {
            console.error(`Error creating ticket for session ${session.id}:`, ticketError);
          } else {
            console.log(`Successfully created ticket: ${ticket.id}`);
            createdTickets.push({
              sessionId: session.id,
              ticketId: ticket.id,
              amount: session.amount_total
            });
            ticketsCreated++;
          }
        } else {
          console.log(`Ticket already exists for session: ${session.id}`);
        }
      }
    }

    console.log(`Recovery complete. Created ${ticketsCreated} tickets`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: ticketsCreated > 0 
        ? `Found and created ${ticketsCreated} missing ticket(s)!` 
        : "No missing tickets found",
      ticketsCreated,
      createdTickets
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error recovering tickets:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});