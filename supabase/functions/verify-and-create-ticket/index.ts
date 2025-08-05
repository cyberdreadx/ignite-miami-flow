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
    const { sessionId, userEmail } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log(`Verifying payment for session: ${sessionId}, email: ${userEmail}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`Session status: ${session.payment_status}, amount: ${session.amount_total}`);

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user ID from email if not in metadata
    let userId = session.metadata?.user_id;
    
    if (!userId && userEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', userEmail)
        .single();
      
      if (profile) {
        userId = profile.user_id;
      }
    }

    if (!userId) {
      throw new Error("Could not find user for this payment");
    }

    // Check if ticket already exists
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingTicket) {
      console.log(`Ticket already exists for session ${sessionId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Ticket already exists",
        ticketId: existingTicket.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate QR code token
    const qrToken = `QR_${Math.random().toString(36).substr(2, 8).toUpperCase()}_${Date.now()}`;
    
    // Calculate validity: 2 days after the next event
    const now = new Date();
    const aug5 = new Date('2025-08-05');
    const aug19 = new Date('2025-08-19');
    let nextEventDate;

    if (now <= aug5) {
      // Today's event or before
      nextEventDate = aug5;
    } else if (now < aug19) {
      // Between Aug 5 and Aug 19
      nextEventDate = aug19;
    } else {
      // After Aug 19, find next Tuesday
      nextEventDate = new Date(aug19);
      while (nextEventDate <= now) {
        nextEventDate.setDate(nextEventDate.getDate() + 7); // Add 7 days for next Tuesday
      }
    }

    // Valid until 2 days after the event
    const validUntil = new Date(nextEventDate);
    validUntil.setDate(validUntil.getDate() + 2);
    validUntil.setHours(23, 59, 59, 999); // End of day

    // Get user profile for proper name display
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', userId)
      .single();

    const userName = profile?.full_name || profile?.email || userEmail;

    const qrData = {
      type: "ticket",
      user_id: userId,
      user_name: userName,
      token: qrToken,
      amount: session.amount_total,
      valid_until: validUntil.toISOString()
    };

    // Create the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        user_id: userId,
        stripe_session_id: sessionId,
        amount: session.amount_total,
        currency: session.currency,
        status: 'paid',
        qr_code_token: qrToken,
        qr_code_data: JSON.stringify(qrData),
        valid_until: validUntil.toISOString()
      })
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      throw new Error(`Failed to create ticket: ${ticketError.message}`);
    }

    console.log(`Ticket created successfully: ${ticket.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Ticket created successfully",
      ticket: ticket
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});