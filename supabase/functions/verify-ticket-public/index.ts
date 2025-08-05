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
    // Create Supabase client using anon key (public function)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { qr_code_token, qr_token } = await req.json();
    const token = qr_code_token || qr_token;
    if (!token) {
      throw new Error("QR code token is required");
    }

    console.log("Public verification for QR code:", token);

    // First check if it's a ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("tickets")
      .select("*")
      .eq("qr_code_token", token)
      .single();

    console.log("Ticket query result:", { ticket, ticketError });

    if (!ticketError && ticket) {
      // Get user profile separately
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", ticket.user_id)
        .single();

      const userName = profile?.full_name || profile?.email || "Unknown";
      const userEmail = profile?.email || "Unknown";
      
      console.log("Returning ticket verification success for:", userName);
      
      // Return complete ticket data for verification page
      return new Response(JSON.stringify({
        success: true,
        ticket: {
          id: ticket.id,
          user_id: ticket.user_id,
          amount: ticket.amount,
          status: ticket.status,
          created_at: ticket.created_at,
          valid_until: ticket.valid_until,
          used_at: ticket.used_at,
          used_by: ticket.used_by,
          qr_code_token: ticket.qr_code_token,
          user_email: userEmail,
          user_name: userName
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If not a ticket, check if it's a subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("qr_code_token", token)
      .single();

    console.log("Subscription query result:", { subscription, subError });

    if (!subError && subscription) {
      // Get user profile separately
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", subscription.user_id)
        .single();

      const userName = profile?.full_name || profile?.email || "Unknown";
      
      // Check subscription validity
      const now = new Date();
      const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
      
      if (subscription.status !== "active") {
        return new Response(JSON.stringify({
          valid: false,
          reason: "This subscription is not active",
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

      if (currentPeriodEnd && now > currentPeriodEnd) {
        return new Response(JSON.stringify({
          valid: false,
          reason: "This monthly pass has expired",
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

    // If not a subscription, check if it's a media pass
    const { data: mediaPass, error: mediaPassError } = await supabaseClient
      .from("media_passes")
      .select("*")
      .eq("qr_code_token", token)
      .single();

    console.log("Media pass query result:", { mediaPass, mediaPassError });

    if (!mediaPassError && mediaPass) {
      // Get user profile separately
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", mediaPass.user_id)
        .single();

      const userName = profile?.full_name || profile?.email || "Unknown";
      
      // Check media pass validity
      const now = new Date();
      const validUntil = mediaPass.valid_until ? new Date(mediaPass.valid_until) : null;
      
      if (mediaPass.status !== "paid") {
        return new Response(JSON.stringify({
          valid: false,
          reason: "This media pass payment is not confirmed",
          type: "media_pass",
          media_pass_info: {
            id: mediaPass.id,
            pass_type: mediaPass.pass_type,
            photographer_name: mediaPass.photographer_name,
            instagram_handle: mediaPass.instagram_handle,
            amount: mediaPass.amount,
            user_name: userName,
            created_at: mediaPass.created_at,
            valid_until: mediaPass.valid_until,
            status: mediaPass.status
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      if (validUntil && now > validUntil) {
        return new Response(JSON.stringify({
          valid: false,
          reason: "This media pass has expired",
          type: "media_pass",
          media_pass_info: {
            id: mediaPass.id,
            pass_type: mediaPass.pass_type,
            photographer_name: mediaPass.photographer_name,
            instagram_handle: mediaPass.instagram_handle,
            amount: mediaPass.amount,
            user_name: userName,
            created_at: mediaPass.created_at,
            valid_until: mediaPass.valid_until,
            status: mediaPass.status
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({
        valid: true,
        type: "media_pass",
        media_pass_info: {
          id: mediaPass.id,
          pass_type: mediaPass.pass_type,
          photographer_name: mediaPass.photographer_name,
          instagram_handle: mediaPass.instagram_handle,
          amount: mediaPass.amount,
          user_name: userName,
          created_at: mediaPass.created_at,
          valid_until: mediaPass.valid_until,
          status: mediaPass.status
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // QR code not found
    return new Response(JSON.stringify({
      success: false,
      error: "This QR code is not valid or has been deactivated"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in public ticket verification:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Unable to verify ticket at this time" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});