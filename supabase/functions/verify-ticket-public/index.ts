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

    // First check if it's a ticket using secure verification
    const { data: ticketData, error: ticketError } = await supabaseClient
      .rpc("verify_qr_token", { token });

    console.log("Ticket verification result:", { ticketData, ticketError });

    if (!ticketError && ticketData && ticketData.length > 0) {
      const verification = ticketData[0];
      
      if (verification.is_valid) {
        console.log("Returning ticket verification success");
        
        // Fetch additional ticket details for display
        const { data: ticketDetails } = await supabaseClient
          .from('tickets')
          .select(`
            id, amount, event_id, created_at, valid_until, used_at, used_by,
            user_id
          `)
          .eq('qr_code_token', token)
          .single();

        // Fetch user profile data separately
        const { data: userProfile } = await supabaseClient
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', ticketDetails?.user_id)
          .single();

        return new Response(JSON.stringify({
          valid: true,
          type: 'ticket',
          ticket_info: {
            id: ticketDetails?.id,
            amount: ticketDetails?.amount,
            event_id: ticketDetails?.event_id,
            user_name: userProfile?.full_name || userProfile?.email || 'Unknown User',
            created_at: ticketDetails?.created_at,
            valid_until: ticketDetails?.valid_until,
            used_at: verification.used_at,
            used_by: verification.used_by
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        return new Response(JSON.stringify({
          valid: false,
          reason: "This ticket is not valid or has been used",
          type: 'ticket'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // If not a ticket, check if it's a subscription using secure verification
    const { data: subscriptionData, error: subError } = await supabaseClient
      .rpc("verify_subscription_qr", { token });

    console.log("Subscription verification result:", { subscriptionData, subError });

    if (!subError && subscriptionData && subscriptionData.length > 0) {
      const verification = subscriptionData[0];
      
      if (!verification.is_valid) {
        let reason = "This subscription is not valid";
        if (verification.subscription_status !== "active") {
          reason = "This subscription is not active";
        } else if (verification.current_period_end && new Date() > new Date(verification.current_period_end)) {
          reason = "This monthly pass has expired";
        }
        
        return new Response(JSON.stringify({
          valid: false,
          reason: reason,
          type: "subscription",
          subscription_info: {
            status: verification.subscription_status,
            current_period_end: verification.current_period_end
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Fetch subscription details for display
      const { data: subscriptionDetails } = await supabaseClient
        .from('subscriptions')
        .select('id, status, current_period_end, created_at, user_id')
        .eq('qr_code_token', token)
        .single();

      // Fetch user profile data separately
      const { data: userProfile } = await supabaseClient
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', subscriptionDetails?.user_id)
        .single();

      return new Response(JSON.stringify({
        valid: true,
        type: 'subscription',
        subscription_info: {
          id: subscriptionDetails?.id,
          status: verification.subscription_status,
          user_name: userProfile?.full_name || userProfile?.email || 'Unknown User',
          current_period_end: verification.current_period_end,
          created_at: subscriptionDetails?.created_at
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If not a subscription, check if it's a media pass using secure verification
    const { data: mediaPassData, error: mediaPassError } = await supabaseClient
      .rpc("verify_media_pass_qr", { token });

    console.log("Media pass verification result:", { mediaPassData, mediaPassError });

    if (!mediaPassError && mediaPassData && mediaPassData.length > 0) {
      const verification = mediaPassData[0];
      
      if (!verification.is_valid) {
        let reason = "This media pass is not valid";
        if (verification.pass_status !== "paid") {
          reason = "This media pass payment is not confirmed";
        } else if (verification.valid_until && new Date() > new Date(verification.valid_until)) {
          reason = "This media pass has expired";
        }
        
        return new Response(JSON.stringify({
          valid: false,
          reason: reason,
          type: "media_pass",
          media_pass_info: {
            pass_type: verification.pass_type,
            photographer_name: verification.photographer_name,
            instagram_handle: verification.instagram_handle,
            valid_until: verification.valid_until,
            status: verification.pass_status
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Fetch media pass details for display  
      const { data: mediaPassDetails } = await supabaseClient
        .from('media_passes')
        .select(`
          id, pass_type, photographer_name, instagram_handle, amount, valid_until, created_at,
          user_id
        `)
        .eq('qr_code_token', token)
        .single();

      // Fetch user profile data separately
      const { data: userProfile } = await supabaseClient
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', mediaPassDetails?.user_id)
        .single();

      return new Response(JSON.stringify({
        valid: true,
        type: 'media_pass',
        media_pass_info: {
          pass_type: verification.pass_type,
          photographer_name: verification.photographer_name,
          instagram_handle: verification.instagram_handle,
          valid_until: verification.valid_until,
          status: verification.pass_status,
          user_name: userProfile?.full_name || userProfile?.email || 'Unknown User',
          created_at: mediaPassDetails?.created_at,
          amount: mediaPassDetails?.amount
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // QR code not found or invalid
    return new Response(JSON.stringify({
      valid: false,
      reason: "This QR code is not valid or has been deactivated"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in public ticket verification:", error);
    return new Response(JSON.stringify({ 
      valid: false,
      reason: "Unable to verify ticket at this time" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});