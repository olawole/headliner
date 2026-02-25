import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Headliner — AI Live Intelligence, Face to Face";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050508",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(248,113,113,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Logo bars */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 36,
              height: 110,
              borderRadius: 18,
              background: "linear-gradient(180deg, #34d399 0%, #059669 100%)",
            }}
          />
          <div
            style={{
              width: 36,
              height: 150,
              borderRadius: 18,
              background: "linear-gradient(180deg, #f87171 0%, #dc2626 100%)",
            }}
          />
          <div
            style={{
              width: 36,
              height: 86,
              borderRadius: 18,
              background: "linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)",
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: 20,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Headliner
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.02em",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          AI Live Intelligence, Face to Face
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            display: "flex",
          }}
        >
          <div style={{ flex: 1, background: "#34d399" }} />
          <div style={{ flex: 1, background: "#f87171" }} />
          <div style={{ flex: 1, background: "#a78bfa" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
