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

    const { qr_code_token, validator_name } = await req.json();
    
    if (!qr_code_token) {
      throw new Error("QR code token is required");
    }

    console.log("Validating QR code:", qr_code_token);

    // First check if it's a ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("tickets")
      .select("*, profiles!tickets_user_id_fkey(full_name, email)")
      .eq("qr_code_token", qr_code_token)
      .single();

    if (!ticketError && ticket) {
      // Validate ticket
      const now = new Date();
      const validUntil = ticket.valid_until ? new Date(ticket.valid_until) : null;
      
      if (ticket.used_at) {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Ticket already used",
          used_at: ticket.used_at,
          used_by: ticket.used_by,
          type: "ticket"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      if (validUntil && now > validUntil) {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Ticket expired",
          valid_until: ticket.valid_until,
          type: "ticket"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      if (ticket.status !== "paid") {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Ticket not paid",
          status: ticket.status,
          type: "ticket"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Mark ticket as used
      const { error: updateError } = await supabaseClient
        .from("tickets")
        .update({
          used_at: now.toISOString(),
          used_by: validator_name || "Door Staff"
        })
        .eq("qr_code_token", qr_code_token);

      if (updateError) {
        console.error("Failed to mark ticket as used:", updateError);
      }

      return new Response(JSON.stringify({
        valid: true,
        type: "ticket",
        ticket_info: {
          id: ticket.id,
          amount: ticket.amount,
          event_id: ticket.event_id,
          user_name: ticket.profiles?.full_name || ticket.profiles?.email || "Unknown",
          created_at: ticket.created_at,
          valid_until: ticket.valid_until
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If not a ticket, check if it's a subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("*, profiles!subscriptions_user_id_fkey(full_name, email)")
      .eq("qr_code_token", qr_code_token)
      .single();

    if (!subError && subscription) {
      // Validate subscription
      const now = new Date();
      const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
      
      if (subscription.status !== "active") {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Subscription not active",
          status: subscription.status,
          type: "subscription"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      if (currentPeriodEnd && now > currentPeriodEnd) {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Subscription expired",
          current_period_end: subscription.current_period_end,
          type: "subscription"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({
        valid: true,
        type: "subscription",
        subscription_info: {
          id: subscription.id,
          status: subscription.status,
          user_name: subscription.profiles?.full_name || subscription.profiles?.email || "Unknown",
          current_period_end: subscription.current_period_end,
          created_at: subscription.created_at
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // QR code not found
    return new Response(JSON.stringify({
      valid: false,
      reason: "QR code not found or invalid",
      qr_code_token
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error validating QR code:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});