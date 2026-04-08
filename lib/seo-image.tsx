import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const seoImageAlt = siteConfig.seo.ogImageAlt;

export const seoImageSize = {
  width: 1200,
  height: 630,
};

export const seoImageContentType = "image/png";

export function generateSeoImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #f8f3ff 0%, #eef6ff 42%, #fff7ed 100%)",
          color: "#111827",
          padding: "54px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "22px",
            borderRadius: "32px",
            border: "1px solid rgba(99, 102, 241, 0.12)",
            background:
              "radial-gradient(circle at top right, rgba(168, 85, 247, 0.18), transparent 38%), rgba(255, 255, 255, 0.78)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            borderRadius: "28px",
            padding: "36px 40px",
            background: "rgba(255, 255, 255, 0.6)",
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "18px",
                  background: "#18181b",
                  color: "#ffffff",
                  fontSize: "28px",
                  fontWeight: 700,
                }}
              >
                A
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 700,
                  }}
                >
                  {siteConfig.name}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#6b7280",
                  }}
                >
                  {siteConfig.tagline}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                background: "rgba(168, 85, 247, 0.12)",
                color: "#7c3aed",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Portfolio
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "900px",
            }}
          >
            <div
              style={{
                fontSize: "62px",
                lineHeight: 1.08,
                fontWeight: 700,
              }}
            >
              {siteConfig.agenda.summary}
            </div>
            <div
              style={{
                fontSize: "26px",
                lineHeight: 1.45,
                color: "#4b5563",
              }}
            >
              {siteConfig.agenda.services.join(" / ")}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...seoImageSize,
    },
  );
}
