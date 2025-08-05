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
    // Get request data
    const { passType, name, instagramHandle } = await req.json();
    
    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Determine price ID based on pass type
    const priceId = passType === "30" 
      ? "prod_SoEFJCpfgiULre" // $30 Media Pass
      : "prod_SoEFbMB170Fk0M"; // $150 Media Pass
    
    const passName = passType === "30" ? "SkateBurn Media Pass - Standard ($30)" : "SkateBurn Media Pass - Premium ($150)";
    const passDescription = passType === "30" 
      ? "Standard media pass with shared usage rights" 
      : "Premium media pass with exclusive content rights";

    // Create a one-time payment session using your product
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/photographers?success=true&pass_type=${passType}`,
      cancel_url: `${req.headers.get("origin")}/photographers?canceled=true`,
      metadata: {
        pass_type: passType,
        photographer_name: name,
        instagram_handle: instagramHandle,
        user_id: user.id,
      }
    });

    // Optional: Store media pass request in database using service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create a simple media_passes table entry
    await supabaseService.from("media_passes").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      pass_type: passType,
      photographer_name: name,
      instagram_handle: instagramHandle,
      amount: passType === "30" ? 3000 : 15000, // Amount in cents
      status: "pending",
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating media pass payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});