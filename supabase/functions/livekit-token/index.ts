// supabase/functions/livekit-token/index.ts
// ─────────────────────────────────────────────────────────────
// Supabase Edge Function — generates a signed LiveKit JWT token
// Runs on Deno. Deploy with: supabase functions deploy livekit-token
// ─────────────────────────────────────────────────────────────

import { AccessToken } from "npm:livekit-server-sdk@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomName, participantName, participantIdentity } = await req.json();

    if (!roomName || !participantName) {
      return new Response(
        JSON.stringify({ error: "roomName and participantName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ Read secrets from Supabase project secrets (never exposed to frontend)
    const apiKey    = Deno.env.get("LIVEKIT_API_KEY");
    const apiSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: "LiveKit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ Create access token using livekit-server-sdk v2
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity || participantName,
      name:     participantName,
      ttl:      "6h", // token expires after 6 hours
    });

    at.addGrant({
      roomJoin:     true,
      room:         roomName,
      canPublish:   true,
      canSubscribe: true,
      canPublishData: true, // ✅ Required for chat (data channels)
    });

    const token = await at.toJwt();

    return new Response(
      JSON.stringify({ token }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Token generation error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});