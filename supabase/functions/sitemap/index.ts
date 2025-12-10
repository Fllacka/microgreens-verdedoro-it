import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

const SITE_URL = "https://verdedoro.it";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Generating sitemap...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("slug, updated_at, priority, change_frequency")
      .eq("published", true);

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // Fetch all published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, priority, change_frequency")
      .eq("published", true);

    if (blogError) {
      console.error("Error fetching blog posts:", blogError);
    }

    // Fetch all published pages
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select("slug, updated_at, priority, change_frequency")
      .eq("published", true);

    if (pagesError) {
      console.error("Error fetching pages:", pagesError);
    }

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/microgreens</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/microgreens-su-misura</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/chi-siamo</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contatti</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

    // Add product pages
    if (products && products.length > 0) {
      sitemap += `\n  <!-- Product Pages -->`;
      for (const product of products) {
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
      }
    }

    // Add blog posts
    if (blogPosts && blogPosts.length > 0) {
      sitemap += `\n  <!-- Blog Posts -->`;
      for (const post of blogPosts) {
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
      }
    }

    // Add custom pages
    if (pages && pages.length > 0) {
      sitemap += `\n  <!-- Custom Pages -->`;
      for (const page of pages) {
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
      }
    }

    sitemap += `\n</urlset>`;

    console.log(`Sitemap generated with ${(products?.length || 0) + (blogPosts?.length || 0) + (pages?.length || 0) + 6} URLs`);

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
