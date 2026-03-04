import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link as LinkIcon, ExternalLink, FileText, X, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LinkDialogProps {
  isActive: boolean;
  currentUrl?: string;
  onSetLink: (url: string, openInNewTab: boolean) => void;
  onRemoveLink: () => void;
  children: React.ReactNode;
}

interface InternalPage {
  label: string;
  path: string;
  type: "page" | "product" | "blog" | "static";
}

const STATIC_PAGES: InternalPage[] = [
  { label: "Home", path: "/", type: "static" },
  { label: "Microgreens", path: "/microgreens", type: "static" },
  { label: "Microgreens su Misura", path: "/microgreens-su-misura", type: "static" },
  { label: "Chi Siamo", path: "/chi-siamo", type: "static" },
  { label: "Blog", path: "/blog", type: "static" },
  { label: "Contatti", path: "/contatti", type: "static" },
];

export const LinkDialog = ({ isActive, currentUrl, onSetLink, onRemoveLink, children }: LinkDialogProps) => {
  const [open, setOpen] = useState(false);
  const [linkType, setLinkType] = useState<"internal" | "external">("external");
  const [url, setUrl] = useState("");
  const [internalPath, setInternalPath] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [internalPages, setInternalPages] = useState<InternalPage[]>(STATIC_PAGES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && linkType === "internal") {
      fetchInternalPages();
    }
  }, [open, linkType]);
  useEffect(() => {
    if (open && currentUrl) {
      // If the link starts with http, it's external. Otherwise, it's internal.
      if (currentUrl.startsWith("http")) {
        setLinkType("external");
        setUrl(currentUrl);
      } else {
        setLinkType("internal");
        setInternalPath(currentUrl);
      }
    } else if (open && !currentUrl) {
      resetForm();
    }
  }, [open, currentUrl]);

  const fetchInternalPages = async () => {
    setLoading(true);
    try {
      const [pagesRes, productsRes, blogRes] = await Promise.all([
        supabase.from("pages").select("title, slug").eq("published", true),
        supabase.from("products").select("name, slug").eq("published", true),
        supabase.from("blog_posts").select("title, slug").eq("published", true),
      ]);

      const pages: InternalPage[] = [...STATIC_PAGES];

      if (pagesRes.data) {
        pagesRes.data.forEach((page) => {
          pages.push({
            label: page.title,
            path: `/${page.slug}`,
            type: "page",
          });
        });
      }

      if (productsRes.data) {
        productsRes.data.forEach((product) => {
          pages.push({
            label: product.name,
            path: `/microgreens/${product.slug}`,
            type: "product",
          });
        });
      }

      if (blogRes.data) {
        blogRes.data.forEach((post) => {
          pages.push({
            label: post.title,
            path: `/blog/${post.slug}`,
            type: "blog",
          });
        });
      }

      setInternalPages(pages);
    } catch (error) {
      console.error("Error fetching internal pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = internalPages.filter(
    (page) =>
      page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedPages = {
    static: filteredPages.filter((p) => p.type === "static"),
    page: filteredPages.filter((p) => p.type === "page"),
    product: filteredPages.filter((p) => p.type === "product"),
    blog: filteredPages.filter((p) => p.type === "blog"),
  };

  const handleSubmit = () => {
    const finalUrl = linkType === "internal" ? internalPath : url;
    if (finalUrl) {
      onSetLink(finalUrl, linkType === "external" ? openInNewTab : false);
      setOpen(false);
      resetForm();
    }
  };

  const handleRemove = () => {
    onRemoveLink();
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setUrl("");
    setInternalPath("");
    setOpenInNewTab(false);
    setSearchQuery("");
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "static":
        return "Pagine Statiche";
      case "page":
        return "Pagine CMS";
      case "product":
        return "Prodotti";
      case "blog":
        return "Articoli Blog";
      default:
        return type;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "static":
        return "bg-muted text-muted-foreground";
      case "page":
        return "bg-blue-100 text-blue-700";
      case "product":
        return "bg-green-100 text-green-700";
      case "blog":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Inserisci Link</h4>
            {isActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Rimuovi
              </Button>
            )}
          </div>

          <Tabs value={linkType} onValueChange={(v) => setLinkType(v as "internal" | "external")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="internal" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Interno
              </TabsTrigger>
              <TabsTrigger value="external" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Esterno
              </TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="space-y-3 mt-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca pagine, prodotti, articoli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {Object.entries(groupedPages).map(
                      ([type, pages]) =>
                        pages.length > 0 && (
                          <div key={type}>
                            <p className="text-xs font-medium text-muted-foreground mb-1 px-1">{getTypeLabel(type)}</p>
                            <div className="space-y-0.5">
                              {pages.map((page) => (
                                <Button
                                  key={page.path}
                                  type="button"
                                  variant={internalPath === page.path ? "secondary" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start text-xs h-8 px-2"
                                  onClick={() => setInternalPath(page.path)}
                                >
                                  <span className="truncate flex-1 text-left">{page.label}</span>
                                  <span
                                    className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${getTypeBadgeClass(page.type)}`}
                                  >
                                    {page.path}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        ),
                    )}
                    {filteredPages.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nessun risultato trovato</p>
                    )}
                  </div>
                </ScrollArea>
              )}

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="custom-path" className="text-xs">
                  Percorso personalizzato
                </Label>
                <Input
                  id="custom-path"
                  placeholder="/percorso-pagina"
                  value={internalPath}
                  onChange={(e) => setInternalPath(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="external" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label htmlFor="external-url" className="text-xs">
                  URL
                </Label>
                <Input
                  id="external-url"
                  placeholder="https://esempio.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-tab" className="text-xs">
                  Apri in nuova scheda
                </Label>
                <Switch id="new-tab" checked={openInNewTab} onCheckedChange={setOpenInNewTab} />
              </div>
            </TabsContent>
          </Tabs>

          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full"
            size="sm"
            disabled={linkType === "internal" ? !internalPath : !url}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {isActive ? "Aggiorna Link" : "Inserisci Link"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
