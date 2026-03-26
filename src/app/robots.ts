import type { MetadataRoute } from "next";
import { getSitemapUrl, isProductionDeployment } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin-preview"],
    },
    sitemap: getSitemapUrl(),
  };
}
