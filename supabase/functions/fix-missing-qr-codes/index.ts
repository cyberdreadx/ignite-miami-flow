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

    console.log("Starting QR code fix process...");

    // Find all paid tickets without QR codes
    const { data: ticketsWithoutQR, error: fetchError } = await supabaseClient
      .from("tickets")
      .select("id, user_id, amount, event_id, valid_until")
      .eq("status", "paid")
      .or("qr_code_token.is.null,qr_code_token.eq.");

    if (fetchError) {
      throw new Error(`Failed to fetch tickets: ${fetchError.message}`);
    }

    console.log(`Found ${ticketsWithoutQR?.length || 0} tickets without QR codes`);

    if (!ticketsWithoutQR || ticketsWithoutQR.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No tickets need QR code fixes",
        fixed_count: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let fixedCount = 0;
    const errors = [];

    // Process each ticket
    for (const ticket of ticketsWithoutQR) {
      try {
        console.log(`Processing ticket ${ticket.id}...`);

        // Generate new QR code token
        const { data: qrToken, error: tokenError } = await supabaseClient.rpc("generate_qr_token");
        
        if (tokenError || !qrToken) {
          console.error(`Failed to generate QR token for ticket ${ticket.id}:`, tokenError);
          errors.push(`Ticket ${ticket.id}: Failed to generate QR token`);
          continue;
        }

        // Get user profile for proper name display
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', ticket.user_id)
          .single();

        const userName = profile?.full_name || profile?.email || 'Unknown User';
        
        // Create QR code data
        const qrData = JSON.stringify({
          type: "ticket",
          id: ticket.id,
          user_id: ticket.user_id,
          user_name: userName,
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
          .eq("id", ticket.id);

        if (updateError) {
          console.error(`Failed to update ticket ${ticket.id}:`, updateError);
          errors.push(`Ticket ${ticket.id}: Failed to update with QR code`);
          continue;
        }

        console.log(`Successfully fixed ticket ${ticket.id} with QR token ${qrToken}`);
        fixedCount++;

      } catch (error) {
        console.error(`Error processing ticket ${ticket.id}:`, error);
        errors.push(`Ticket ${ticket.id}: ${error.message}`);
      }
    }

    console.log(`QR code fix process completed. Fixed: ${fixedCount}, Errors: ${errors.length}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Fixed ${fixedCount} tickets`,
      fixed_count: fixedCount,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in QR code fix process:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});