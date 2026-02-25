const VALYU_AUTH_URL =
  process.env.NEXT_PUBLIC_VALYU_AUTH_URL || "https://auth.valyu.ai";
const CLIENT_ID = process.env.NEXT_PUBLIC_VALYU_CLIENT_ID || "";
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_REDIRECT_URI ||
  "http://localhost:3000/auth/valyu/callback";

export interface UserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

/** Generate a cryptographically random code verifier for PKCE */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/** Compute the SHA-256 code challenge from a code verifier */
export async function generateCodeChallenge(
  verifier: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(new Uint8Array(digest));
}

function base64URLEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/** Check whether OAuth env vars are configured */
export function isOAuthConfigured(): boolean {
  return Boolean(CLIENT_ID && REDIRECT_URI);
}

/** Kick off the full OAuth 2.0 Authorization Code + PKCE flow */
export async function initiateOAuthFlow(): Promise<void> {
  if (!isOAuthConfigured()) {
    throw new Error("OAuth is not configured. Set NEXT_PUBLIC_VALYU_CLIENT_ID and NEXT_PUBLIC_REDIRECT_URI.");
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Persist PKCE data for the callback
  localStorage.setItem("oauth_code_verifier", codeVerifier);
  localStorage.setItem("oauth_state", state);
  localStorage.setItem("oauth_timestamp", Date.now().toString());

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid profile email",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });

  window.location.href = `${VALYU_AUTH_URL}/auth/v1/oauth/authorize?${params.toString()}`;
}
