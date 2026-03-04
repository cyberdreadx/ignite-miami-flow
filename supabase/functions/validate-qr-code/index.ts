// @ts-ignore - Deno runtime import
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Deno runtime import  
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// @ts-ignore - Deno global available at runtime
serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { qr_code_token: rawToken, validator_name, mark_as_used = true } = await req.json();
    
    // Extract just the token if a full URL was scanned
    const tokenMatch = rawToken?.match(/[?&]token=([^&]+)/);
    const qr_code_token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : rawToken;
    
    if (!qr_code_token) {
      throw new Error("QR code token is required");
    }

    console.log("Validating QR code token:", qr_code_token);

    // Check tickets table - token stored in qr_code column
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("tickets")
      .select("id, user_id, created_at, event_id, used_at, used_by, status, qr_code")
      .eq("qr_code", qr_code_token)
      .maybeSingle();

    console.log("Ticket query result:", { ticket, ticketError });

    if (!ticketError && ticket) {
      // Get user profile
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", ticket.user_id)
        .maybeSingle();

      const userName = profile?.full_name || profile?.email || "Unknown";

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

      if (ticket.status !== "paid" && ticket.status !== "active" && ticket.status !== "used") {
        return new Response(JSON.stringify({
          valid: false,
          reason: `Ticket status: ${ticket.status || "unknown"}`,
          status: ticket.status,
          type: "ticket"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Mark as used if requested
      if (mark_as_used) {
        const { error: updateError } = await supabaseClient
          .from("tickets")
          .update({
            used_at: new Date().toISOString(),
            used_by: validator_name || "Door Staff"
          })
          .eq("id", ticket.id);

        if (updateError) {
          console.error("Failed to mark ticket as used:", updateError);
        }
      }

      return new Response(JSON.stringify({
        valid: true,
        type: "ticket",
        ticket_info: {
          id: ticket.id,
          event_id: ticket.event_id,
          user_name: userName,
          created_at: ticket.created_at,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check subscriptions
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("id, user_id, created_at, status, current_period_end")
      .eq("stripe_subscription_id", qr_code_token)
      .maybeSingle();

    console.log("Subscription query result:", { subscription, subError });

    if (!subError && subscription) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", subscription.user_id)
        .maybeSingle();

      const userName = profile?.full_name || profile?.email || "Unknown";

      const isActive = subscription.status === "active";
      const notExpired = !subscription.current_period_end || new Date() <= new Date(subscription.current_period_end);

      if (!isActive || !notExpired) {
        return new Response(JSON.stringify({
          valid: false,
          reason: !isActive ? "Subscription not active" : "Subscription expired",
          status: subscription.status,
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
          user_name: userName,
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

  } catch (error: any) {
    console.error("Error validating QR code:", error);
    return new Response(JSON.stringify({ 
      error: error?.message || "An error occurred during validation" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
