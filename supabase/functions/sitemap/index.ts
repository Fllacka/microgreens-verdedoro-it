import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

const SITE_URL = "https://microgreens.verdedoro.it";

// Static pages mapped to their section tables and URL paths
const STATIC_PAGES: {
  path: string;
  table: string;
  defaultChangeFreq: string;
  defaultPriority: string;
}[] = [
  {
    path: "/",
    table: "homepage_sections",
    defaultChangeFreq: "daily",
    defaultPriority: "1.0",
  },
  {
    path: "/microgreens",
    table: "microgreens_sections",
    defaultChangeFreq: "weekly",
    defaultPriority: "0.9",
  },
  {
    path: "/microgreens-su-misura",
    table: "microgreens_custom_sections",
    defaultChangeFreq: "monthly",
    defaultPriority: "0.8",
  },
  {
    path: "/chi-siamo",
    table: "chi_siamo_sections",
    defaultChangeFreq: "monthly",
    defaultPriority: "0.7",
  },
  {
    path: "/cosa-sono-i-microgreens",
    table: "cosa_sono_microgreens_sections",
    defaultChangeFreq: "monthly",
    defaultPriority: "0.7",
  },
  {
    path: "/blog",
    table: "blog_overview_sections",
    defaultChangeFreq: "weekly",
    defaultPriority: "0.8",
  },
  {
    path: "/contatti",
    table: "contatti_sections",
    defaultChangeFreq: "monthly",
    defaultPriority: "0.6",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Generating sitemap...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let urlCount = 0;

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // --- Static pages from section tables ---
    sitemap += `\n  <!-- Static Pages -->`;
    for (const page of STATIC_PAGES) {
      try {
        const { data, error } = await supabase
          .from(page.table)
          .select("content, updated_at")
          .eq("id", "seo")
          .single();

        if (error) {
          console.error(`Error fetching SEO from ${page.table}:`, error.message);
        }

        const content = (data?.content as Record<string, unknown>) || {};
        const updatedAt = data?.updated_at;

        // Check for noindex
        const robots =
          (content.robots as string) || "index, follow";
        if (robots.includes("noindex")) continue;

        // Support both snake_case and camelCase keys used by different admin pages
        const changefreq =
          (content.change_frequency as string) ||
          (content.changeFrequency as string) ||
          page.defaultChangeFreq;
        const priority =
          (content.priority as string) || page.defaultPriority;
        const lastmod = updatedAt
          ? new Date(updatedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        sitemap += `
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
        urlCount++;
      } catch (e) {
        console.error(`Failed to process ${page.table}:`, e);
      }
    }

    // --- Products ---
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("slug, updated_at, priority, change_frequency, robots")
      .eq("published", true);

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    if (products && products.length > 0) {
      sitemap += `\n  <!-- Product Pages -->`;
      for (const product of products) {
        if (product.robots && product.robots.includes("noindex")) continue;
        const lastmod = product.updated_at
          ? new Date(product.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        const priority = product.priority || 0.8;
        const changefreq = product.change_frequency || "weekly";

        sitemap += `
  <url>
    <loc>${SITE_URL}/microgreens/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
        urlCount++;
      }
    }

    // --- Blog posts ---
    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, priority, change_frequency, robots")
      .eq("published", true);

    if (blogError) {
      console.error("Error fetching blog posts:", blogError);
    }

    if (blogPosts && blogPosts.length > 0) {
      sitemap += `\n  <!-- Blog Posts -->`;
      for (const post of blogPosts) {
        if (post.robots && post.robots.includes("noindex")) continue;
        const lastmod = post.updated_at
          ? new Date(post.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        const priority = post.priority || 0.7;
        const changefreq = post.change_frequency || "monthly";

        sitemap += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
        urlCount++;
      }
    }

    // --- Custom pages ---
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select("slug, updated_at, priority, change_frequency, robots")
      .eq("published", true);

    if (pagesError) {
      console.error("Error fetching pages:", pagesError);
    }

    if (pages && pages.length > 0) {
      sitemap += `\n  <!-- Custom Pages -->`;
      for (const page of pages) {
        if (page.robots && page.robots.includes("noindex")) continue;
        const lastmod = page.updated_at
          ? new Date(page.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        const priority = page.priority || 0.6;
        const changefreq = page.change_frequency || "monthly";

        sitemap += `
  <url>
    <loc>${SITE_URL}/${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
        urlCount++;
      }
    }

    sitemap += `\n</urlset>`;

    console.log(`Sitemap generated with ${urlCount} URLs`);

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { headers: corsHeaders, status: 200 }
    );
  }
});
