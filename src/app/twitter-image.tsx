import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Headliner — AI Live Intelligence, Face to Face";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
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
            top: -80,
            left: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Left: Logo bars */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 14,
            marginRight: 64,
          }}
        >
          <div
            style={{
              width: 32,
              height: 100,
              borderRadius: 16,
              background:
                "linear-gradient(180deg, #34d399 0%, #059669 100%)",
            }}
          />
          <div
            style={{
              width: 32,
              height: 140,
              borderRadius: 16,
              background:
                "linear-gradient(180deg, #f87171 0%, #dc2626 100%)",
            }}
          />
          <div
            style={{
              width: 32,
              height: 80,
              borderRadius: 16,
              background:
                "linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)",
            }}
          />
        </div>

        {/* Right: Text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            Headliner
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.02em",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            AI Live Intelligence, Face to Face
          </div>
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
