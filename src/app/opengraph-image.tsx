import { createOgImage } from "@/lib/og-image";
import { SITE_BRAND_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const alt = SITE_BRAND_NAME;
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default function OpenGraphImage() {
  return createOgImage({
    title: SITE_BRAND_NAME,
    subtitle: SITE_DESCRIPTION,
    footer: "Quang Minh",
  });
}
