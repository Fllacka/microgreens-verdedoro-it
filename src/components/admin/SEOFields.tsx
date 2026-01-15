import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SERPPreview } from "./SERPPreview";
import { cn } from "@/lib/utils";
import { Wand2 } from "lucide-react";

interface SEOFieldsProps {
  values: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    canonicalUrl: string;
    robots: string;
    changeFrequency: string;
    priority: string;
    structuredData: string;
  };
  onChange: (field: string, value: string) => void;
  baseUrl?: string;
  onGenerateStructuredData?: () => string | null;
  generateButtonLabel?: string;
}

const CharacterCounter = ({ current, max, optimal }: { current: number; max: number; optimal?: number }) => {
  const getColor = () => {
    if (current === 0) return "text-muted-foreground";
    if (current > max) return "text-destructive";
    if (optimal && current >= optimal) return "text-primary";
    if (current >= max * 0.8) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <span className={cn("text-xs transition-colors", getColor())}>
      {current}/{max} caratteri
      {current > max && " (troppo lungo)"}
    </span>
  );
};

export const SEOFields = ({ 
  values, 
  onChange, 
  baseUrl = "verdedoro.it",
  onGenerateStructuredData,
  generateButtonLabel = "Genera"
}: SEOFieldsProps) => {
  const previewUrl = values.slug ? `${baseUrl}/${values.slug}` : baseUrl;
  const [jsonError, setJsonError] = useState<string | null>(null);

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e) {
      setJsonError("JSON non valido");
    }
  };

  const handleGenerateClick = () => {
    if (onGenerateStructuredData) {
      const generated = onGenerateStructuredData();
      if (generated) {
        onChange("structuredData", generated);
        setJsonError(null);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impostazioni SEO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SERP Preview */}
        <SERPPreview
          title={values.metaTitle}
          description={values.metaDescription}
          url={previewUrl}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug URL *</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(e) => onChange("slug", e.target.value)}
              placeholder="url-della-pagina"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Percorso Canonico</Label>
            <Input
              id="canonicalUrl"
              value={values.canonicalUrl}
              onChange={(e) => onChange("canonicalUrl", e.target.value)}
              placeholder="/percorso-alternativo"
            />
            <span className="text-xs text-muted-foreground">
              Lascia vuoto per auto-riferimento. Inserisci solo il percorso (es. /blog/articolo).
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaTitle">Titolo Meta</Label>
          <Input
            id="metaTitle"
            value={values.metaTitle}
            onChange={(e) => onChange("metaTitle", e.target.value)}
            placeholder="Titolo pagina (ideale: 50-60 caratteri)"
            className={cn(
              values.metaTitle.length > 60 && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <CharacterCounter current={values.metaTitle.length} max={60} optimal={50} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Descrizione Meta</Label>
          <Textarea
            id="metaDescription"
            value={values.metaDescription}
            onChange={(e) => onChange("metaDescription", e.target.value)}
            placeholder="Descrizione pagina (ideale: 150-160 caratteri)"
            rows={3}
            className={cn(
              values.metaDescription.length > 160 && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <CharacterCounter current={values.metaDescription.length} max={160} optimal={150} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ogTitle">Titolo Open Graph</Label>
          <Input
            id="ogTitle"
            value={values.ogTitle}
            onChange={(e) => onChange("ogTitle", e.target.value)}
            placeholder="Titolo per la condivisione sui social"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ogDescription">Descrizione Open Graph</Label>
          <Textarea
            id="ogDescription"
            value={values.ogDescription}
            onChange={(e) => onChange("ogDescription", e.target.value)}
            placeholder="Descrizione per la condivisione sui social"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="robots">Indicizzazione</Label>
            <Select value={values.robots} onValueChange={(value) => onChange("robots", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index, follow">Indicizza e Segui</SelectItem>
                <SelectItem value="noindex, follow">Non Indicizzare, Segui</SelectItem>
                <SelectItem value="index, nofollow">Indicizza, Non Seguire</SelectItem>
                <SelectItem value="noindex, nofollow">Non Indicizzare, Non Seguire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="changeFrequency">Frequenza Aggiornamento</Label>
            <Select value={values.changeFrequency} onValueChange={(value) => onChange("changeFrequency", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Sempre</SelectItem>
                <SelectItem value="hourly">Ogni Ora</SelectItem>
                <SelectItem value="daily">Giornaliero</SelectItem>
                <SelectItem value="weekly">Settimanale</SelectItem>
                <SelectItem value="monthly">Mensile</SelectItem>
                <SelectItem value="yearly">Annuale</SelectItem>
                <SelectItem value="never">Mai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorità (0.0-1.0)</Label>
            <Input
              id="priority"
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={values.priority}
              onChange={(e) => onChange("priority", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="structuredData">Dati Strutturati JSON-LD (opzionale)</Label>
            {onGenerateStructuredData && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateClick}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {generateButtonLabel}
              </Button>
            )}
          </div>
          <Textarea
            id="structuredData"
            value={values.structuredData}
            onChange={(e) => {
              onChange("structuredData", e.target.value);
              validateJson(e.target.value);
            }}
            placeholder='{"@context": "https://schema.org", "@type": "Product", ...}'
            rows={12}
            className={cn(
              "font-mono text-sm",
              jsonError && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {jsonError ? (
            <span className="text-xs text-destructive">{jsonError}</span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Clicca "Genera" per creare automaticamente i dati strutturati basati sul contenuto.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
