// @ts-ignore - Deno runtime import
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Deno runtime import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using service role key (bypasses RLS)
    const supabaseClient = createClient(
      // @ts-ignore - Deno environment variable
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore - Deno environment variable
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error("Admin access required");
    }

    const { ticketId } = await req.json();
    
    if (!ticketId) {
      throw new Error("Ticket ID is required");
    }

    // Delete the ticket (service role bypasses RLS)
    const { error: deleteError } = await supabaseClient
      .from("tickets")
      .delete()
      .eq("id", ticketId);

    if (deleteError) {
      throw new Error(`Failed to delete ticket: ${deleteError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Ticket deleted successfully",
      ticketId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Delete ticket error:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});