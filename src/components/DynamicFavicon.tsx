import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const getMimeType = (url: string): string => {
  const ext = url.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ico": return "image/x-icon";
    case "png": return "image/png";
    case "svg": return "image/svg+xml";
    case "webp": return "image/webp";
    case "jpg":
    case "jpeg": return "image/jpeg";
    default: return "image/png";
  }
};

const DynamicFavicon = () => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("favicon_id, media!site_settings_favicon_id_fkey (file_path)")
          .eq("id", "default")
          .maybeSingle();

        if (error) throw error;

        const fm = (data as any)?.media as { file_path: string } | null;
        if (fm?.file_path) {
          setFaviconUrl(fm.file_path);
        }
      } catch (err) {
        console.error("Error fetching favicon:", err);
      }
    };

    fetchFavicon();
  }, []);

  useEffect(() => {
    const url = faviconUrl || "/favicon.ico";
    const mimeType = getMimeType(url);

    // Update or create <link rel="icon">
    let iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!iconLink) {
      iconLink = document.createElement("link");
      iconLink.rel = "icon";
      document.head.appendChild(iconLink);
    }
    iconLink.href = url;
    iconLink.type = mimeType;

    // Update or create <link rel="apple-touch-icon">
    let appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.head.appendChild(appleLink);
    }
    appleLink.href = url;
  }, [faviconUrl]);

  return null;
};

export default DynamicFavicon;
