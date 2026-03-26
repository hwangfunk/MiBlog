import { ImageResponse } from "next/og";
import { OG_IMAGE_SIZE, SITE_BRAND_NAME, SITE_DESCRIPTION } from "@/lib/seo";

function getTitleFontSize(title: string) {
  if (title.length > 90) {
    return 48;
  }

  if (title.length > 60) {
    return 58;
  }

  return 72;
}

export function createOgImage({
  title,
  eyebrow = SITE_BRAND_NAME,
  subtitle = SITE_DESCRIPTION,
  footer = "blog.quangmin.me",
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  footer?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgb(3, 7, 18) 0%, rgb(10, 16, 33) 45%, rgb(23, 37, 84) 100%)",
          color: "rgb(248, 250, 252)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "999px",
            background: "rgba(34, 211, 238, 0.14)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -80,
            width: 420,
            height: 420,
            borderRadius: "999px",
            background: "rgba(14, 165, 233, 0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 36,
            border: "1px solid rgba(148, 163, 184, 0.18)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "999px",
                background: "rgb(34, 211, 238)",
                boxShadow: "0 0 0 10px rgba(34, 211, 238, 0.15)",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(226, 232, 240, 0.82)",
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 980,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: getTitleFontSize(title),
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.5,
                color: "rgba(203, 213, 225, 0.88)",
                maxWidth: 920,
              }}
            >
              {subtitle}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 24,
              color: "rgba(148, 163, 184, 0.9)",
            }}
          >
            <div style={{ display: "flex" }}>{SITE_BRAND_NAME}</div>
            <div style={{ display: "flex" }}>{footer}</div>
          </div>
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
