import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    // Create Supabase client using service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const { ticket_id, subscription_id } = await req.json();
    
    if (!ticket_id && !subscription_id) {
      throw new Error("Either ticket_id or subscription_id is required");
    }

    let result;
    
    if (ticket_id) {
      // Generate QR code for ticket
      const { data: ticket, error: ticketError } = await supabaseClient
        .from("tickets")
        .select("*")
        .eq("id", ticket_id)
        .eq("user_id", userData.user.id)
        .single();

      if (ticketError || !ticket) throw new Error("Ticket not found");
      if (ticket.qr_code_token) {
        // Return existing QR code
        result = {
          qr_code_token: ticket.qr_code_token,
          qr_code_data: ticket.qr_code_data,
          type: "ticket"
        };
      } else {
        // Generate new QR code token
        const { data: tokenData } = await supabaseClient.rpc("generate_qr_token");
        const qrToken = tokenData;
        
        // Create QR code data (JSON string with verification info)
        const qrData = JSON.stringify({
          type: "ticket",
          id: ticket.id,
          user_id: userData.user.id,
          token: qrToken,
          event_id: ticket.event_id,
          amount: ticket.amount,
          valid_until: ticket.valid_until
        });

        // Update ticket with QR code data
        const { error: updateError } = await supabaseClient
          .from("tickets")
          .update({
            qr_code_token: qrToken,
            qr_code_data: qrData
          })
          .eq("id", ticket_id);

        if (updateError) throw new Error("Failed to update ticket with QR code");

        result = {
          qr_code_token: qrToken,
          qr_code_data: qrData,
          type: "ticket"
        };
      }
    } else {
      // Generate QR code for subscription
      const { data: subscription, error: subError } = await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("id", subscription_id)
        .eq("user_id", userData.user.id)
        .single();

      if (subError || !subscription) throw new Error("Subscription not found");
      
      if (subscription.qr_code_token) {
        // Return existing QR code
        result = {
          qr_code_token: subscription.qr_code_token,
          qr_code_data: subscription.qr_code_data,
          type: "subscription"
        };
      } else {
        // Generate new QR code token
        const { data: tokenData } = await supabaseClient.rpc("generate_qr_token");
        const qrToken = tokenData;
        
        // Create QR code data
        const qrData = JSON.stringify({
          type: "subscription",
          id: subscription.id,
          user_id: userData.user.id,
          token: qrToken,
          status: subscription.status,
          current_period_end: subscription.current_period_end
        });

        // Update subscription with QR code data
        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .update({
            qr_code_token: qrToken,
            qr_code_data: qrData
          })
          .eq("id", subscription_id);

        if (updateError) throw new Error("Failed to update subscription with QR code");

        result = {
          qr_code_token: qrToken,
          qr_code_data: qrData,
          type: "subscription"
        };
      }
    }

    console.log("QR code generated successfully:", result.qr_code_token);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating QR code:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});