import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link as LinkIcon, ExternalLink, FileText, X } from "lucide-react";

interface LinkDialogProps {
  isActive: boolean;
  onSetLink: (url: string, openInNewTab: boolean) => void;
  onRemoveLink: () => void;
  children: React.ReactNode;
}

const INTERNAL_PAGES = [
  { label: "Home", path: "/" },
  { label: "Microgreens", path: "/microgreens" },
  { label: "Microgreens Custom", path: "/microgreens-custom" },
  { label: "Chi Siamo", path: "/chi-siamo" },
  { label: "Blog", path: "/blog" },
  { label: "Contatti", path: "/contatti" },
];

export const LinkDialog = ({ isActive, onSetLink, onRemoveLink, children }: LinkDialogProps) => {
  const [open, setOpen] = useState(false);
  const [linkType, setLinkType] = useState<"internal" | "external">("external");
  const [url, setUrl] = useState("");
  const [internalPath, setInternalPath] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(false);

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
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
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
              <div className="space-y-2">
                <Label className="text-xs">Seleziona pagina</Label>
                <div className="grid gap-1 max-h-32 overflow-y-auto">
                  {INTERNAL_PAGES.map((page) => (
                    <Button
                      key={page.path}
                      type="button"
                      variant={internalPath === page.path ? "secondary" : "ghost"}
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => setInternalPath(page.path)}
                    >
                      {page.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-path" className="text-xs">O inserisci percorso</Label>
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
                <Label htmlFor="external-url" className="text-xs">URL</Label>
                <Input
                  id="external-url"
                  placeholder="https://esempio.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-tab" className="text-xs">Apri in nuova scheda</Label>
                <Switch
                  id="new-tab"
                  checked={openInNewTab}
                  onCheckedChange={setOpenInNewTab}
                />
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
