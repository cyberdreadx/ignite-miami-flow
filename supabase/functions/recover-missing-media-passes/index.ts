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

  // Initialize Supabase client with service role key for bypassing RLS
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");
    const user = userData.user;

    console.log("Checking for missing media passes for user:", user.email);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    let createdCount = 0;
    const createdMediaPasses = [];

    // First, try to find a Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let stripeCustomer = null;
    
    if (customers.data.length > 0) {
      stripeCustomer = customers.data[0];
      console.log("Found Stripe customer:", stripeCustomer.id);
    } else {
      console.log("No Stripe customer found for", user.email, ", searching checkout sessions by metadata");
    }

    // Search for checkout sessions by metadata or email
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
    });

    // Filter sessions that could belong to this user
    const userSessions = sessions.data.filter(session => {
      // Check if session belongs to this user by email or metadata
      return session.customer_email === user.email || 
             (session.metadata && session.metadata.user_id === user.id);
    });

    console.log(`Found ${userSessions.length} sessions by metadata/email for user ${user.email}`);

    for (const session of userSessions) {
      console.log(`Checking session: ${session.id}, amount: ${session.amount_total}`);
      
      // Only process paid sessions
      if (session.payment_status === 'paid' && session.mode === 'payment') {
        // Check if this is a media pass session (based on price range or metadata)
        const isMediaPassSession = session.metadata?.pass_type || 
          (session.amount_total && (session.amount_total === 3000 || session.amount_total === 15000));

        if (isMediaPassSession) {
          // Check if we already have a media pass for this session
          const { data: existingMediaPass } = await supabaseClient
            .from("media_passes")
            .select("id")
            .eq("stripe_session_id", session.id)
            .single();

          if (existingMediaPass) {
            console.log("Media pass already exists for session:", session.id);
            continue;
          }

          console.log("Creating missing media pass for session:", session.id);
          
          // Get user profile for display name
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', user.id)
            .single();

          const userName = profile?.full_name || profile?.email || user.email;
          
          // Generate QR code token
          const { data: tokenData } = await supabaseClient.rpc("generate_qr_token");
          const qrToken = tokenData;

          // Determine pass type and validity (2 days after current or next event)
          const passType = session.metadata?.pass_type || 
            (session.amount_total === 3000 ? "30" : "150");
          
          // Calculate validity (2 days after current or next event, same as tickets)
          const now = new Date();
          const aug5 = new Date('2025-08-05');
          const aug19 = new Date('2025-08-19');
          
          let validUntil;
          if (now <= aug5) {
            // If today or before Aug 5th, valid until Aug 7th
            validUntil = new Date('2025-08-07T23:59:59.999Z');
          } else if (now <= aug19) {
            // If between Aug 5th and Aug 19th, valid until Aug 21st
            validUntil = new Date('2025-08-21T23:59:59.999Z');
          } else {
            // After Aug 19th, find next Tuesday and add 2 days
            const nextTuesday = new Date(now);
            const dayOfWeek = nextTuesday.getDay();
            const daysUntilTuesday = dayOfWeek === 2 ? 0 : (2 + 7 - dayOfWeek) % 7;
            nextTuesday.setDate(nextTuesday.getDate() + daysUntilTuesday);
            nextTuesday.setDate(nextTuesday.getDate() + 2); // 2 days after
            nextTuesday.setHours(23, 59, 59, 999);
            validUntil = nextTuesday;
          }

          // Create QR code data
          const qrData = JSON.stringify({
            type: "media_pass",
            user_id: user.id,
            user_name: userName,
            token: qrToken,
            pass_type: passType,
            photographer_name: session.metadata?.photographer_name || userName,
            instagram_handle: session.metadata?.instagram_handle || "",
            amount: session.amount_total,
            valid_until: validUntil.toISOString()
          });

          // Create the media pass record
          const { data: newMediaPass, error: mediaPassError } = await supabaseClient
            .from("media_passes")
            .insert({
              user_id: user.id,
              stripe_session_id: session.id,
              pass_type: passType,
              photographer_name: session.metadata?.photographer_name || userName,
              instagram_handle: session.metadata?.instagram_handle || "",
              amount: session.amount_total,
              status: "paid",
              qr_code_token: qrToken,
              qr_code_data: qrData,
              valid_until: validUntil.toISOString(),
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (mediaPassError) {
            console.error("Error creating media pass:", mediaPassError);
            continue;
          }

          console.log("Successfully created media pass:", newMediaPass.id);
          createdCount++;
          createdMediaPasses.push(newMediaPass);
        }
      }
    }

    console.log(`Recovery complete. Created ${createdCount} media passes`);

    return new Response(JSON.stringify({
      success: true,
      created_count: createdCount,
      created_media_passes: createdMediaPasses
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in media pass recovery:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});