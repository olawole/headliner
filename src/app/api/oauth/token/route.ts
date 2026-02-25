import { NextRequest, NextResponse } from "next/server";

const VALYU_AUTH_URL =
  process.env.NEXT_PUBLIC_VALYU_AUTH_URL || "https://auth.valyu.ai";
const VALYU_APP_URL =
  process.env.VALYU_APP_URL || "https://platform.valyu.ai";
const CLIENT_ID = process.env.NEXT_PUBLIC_VALYU_CLIENT_ID || "";
const CLIENT_SECRET = process.env.VALYU_CLIENT_SECRET || "";
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_REDIRECT_URI ||
  "http://localhost:3000/auth/valyu/callback";

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier } = await request.json();

    if (!code || !codeVerifier) {
      return NextResponse.json(
        { error: "Missing code or codeVerifier" },
        { status: 400 }
      );
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        { error: "OAuth not configured on server" },
        { status: 500 }
      );
    }

    // Exchange authorization code for tokens using client_secret_basic
    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    const tokenResponse = await fetch(
      `${VALYU_AUTH_URL}/auth/v1/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.json(
        { error: "Token exchange failed" },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    // Fetch user info
    const userInfoResponse = await fetch(
      `${VALYU_APP_URL}/api/oauth/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    let user = { sub: "unknown", email: "", name: "" };
    if (userInfoResponse.ok) {
      user = await userInfoResponse.json();
    }

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user,
    });
  } catch (error) {
    console.error("OAuth token exchange error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
