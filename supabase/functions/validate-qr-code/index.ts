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

    // First check if it's a ticket using secure verification
    const { data: ticketData, error: ticketError } = await supabaseClient
      .rpc("verify_qr_token", { token: qr_code_token });

    console.log("Staff validation - Ticket query:", { ticketData, ticketError });

    if (!ticketError && ticketData && ticketData.length > 0) {
      const verification = ticketData[0];
      
      // For staff validation, we need to check the full ticket details
      const { data: ticket, error: ticketDetailError } = await supabaseClient
        .from("tickets")
        .select("id, user_id, created_at, event_id, used_at, used_by")
        .eq("qr_code_token", qr_code_token)
        .single();

      if (ticketDetailError || !ticket) {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Ticket not found",
          type: "ticket"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Get user profile separately
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", ticket.user_id)
        .single();

      const userName = profile?.full_name || profile?.email || "Unknown";
      
      if (verification.used_at) {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Ticket already used",
          used_at: verification.used_at,
          used_by: verification.used_by,
          type: "ticket"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const now = new Date();
      const validUntil = verification.valid_until ? new Date(verification.valid_until) : null;

      if (validUntil && now > validUntil) {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Ticket expired",
          valid_until: verification.valid_until,
          type: "ticket"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      if (verification.ticket_status !== "paid") {
        return new Response(JSON.stringify({
          valid: false,
          reason: "Ticket not paid",
          status: verification.ticket_status,
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
          event_id: verification.event_id,
          user_name: userName,
          created_at: ticket.created_at,
          valid_until: verification.valid_until
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If not a ticket, check if it's a subscription using secure verification
    const { data: subscriptionData, error: subError } = await supabaseClient
      .rpc("verify_subscription_qr", { token: qr_code_token });

    console.log("Staff validation - Subscription query:", { subscriptionData, subError });

    if (!subError && subscriptionData && subscriptionData.length > 0) {
      const verification = subscriptionData[0];
      
      // For staff validation, get user details
      const { data: subscription } = await supabaseClient
        .from("subscriptions")
        .select("id, user_id, created_at")
        .eq("qr_code_token", qr_code_token)
        .single();
        
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", subscription?.user_id)
        .single();

      const userName = profile?.full_name || profile?.email || "Unknown";
      
      if (!verification.is_valid) {
        let reason = "Subscription not valid";
        if (verification.subscription_status !== "active") {
          reason = "Subscription not active";
        } else if (verification.current_period_end && new Date() > new Date(verification.current_period_end)) {
          reason = "Subscription expired";
        }
        
        return new Response(JSON.stringify({
          valid: false,
          reason: reason,
          status: verification.subscription_status,
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
          id: subscription?.id,
          status: verification.subscription_status,
          user_name: userName,
          current_period_end: verification.current_period_end,
          created_at: subscription?.created_at
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If not a subscription, check if it's a media pass using secure verification
    const { data: mediaPassData, error: mediaPassError } = await supabaseClient
      .rpc("verify_media_pass_qr", { token: qr_code_token });

    console.log("Staff validation - Media pass query:", { mediaPassData, mediaPassError });

    if (!mediaPassError && mediaPassData && mediaPassData.length > 0) {
      const verification = mediaPassData[0];
      
      // For staff validation, get additional details if needed
      const { data: mediaPass } = await supabaseClient
        .from("media_passes")
        .select("id, user_id, created_at")
        .eq("qr_code_token", qr_code_token)
        .single();
        
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", mediaPass?.user_id)
        .single();

      const userName = profile?.full_name || profile?.email || "Unknown";
      
      if (!verification.is_valid) {
        let reason = "Media pass not valid";
        if (verification.pass_status !== "paid") {
          reason = "Media pass not paid";
        } else if (verification.valid_until && new Date() > new Date(verification.valid_until)) {
          reason = "Media pass expired";
        }
        
        return new Response(JSON.stringify({
          valid: false,
          reason: reason,
          status: verification.pass_status,
          type: "media_pass"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Media passes don't get "used up" like tickets - they remain valid until expiry
      return new Response(JSON.stringify({
        valid: true,
        type: "media_pass",
        media_pass_info: {
          id: mediaPass?.id,
          pass_type: verification.pass_type,
          photographer_name: verification.photographer_name,
          instagram_handle: verification.instagram_handle,
          user_name: userName,
          created_at: mediaPass?.created_at,
          valid_until: verification.valid_until,
          status: verification.pass_status
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