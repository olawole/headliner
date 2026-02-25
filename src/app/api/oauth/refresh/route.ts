import { NextRequest, NextResponse } from "next/server";

const VALYU_AUTH_URL =
  process.env.NEXT_PUBLIC_VALYU_AUTH_URL || "https://auth.valyu.ai";
const CLIENT_ID = process.env.NEXT_PUBLIC_VALYU_CLIENT_ID || "";
const CLIENT_SECRET = process.env.VALYU_CLIENT_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Missing refresh token" },
        { status: 400 }
      );
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        { error: "OAuth not configured on server" },
        { status: 500 }
      );
    }

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
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token refresh failed:", errorText);
      return NextResponse.json(
        { error: "Token refresh failed" },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error("OAuth token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
