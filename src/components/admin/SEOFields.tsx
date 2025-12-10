import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SERPPreview } from "./SERPPreview";
import { cn } from "@/lib/utils";

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

export const SEOFields = ({ values, onChange, baseUrl = "verdedoro.it" }: SEOFieldsProps) => {
  const previewUrl = values.slug ? `${baseUrl}/${values.slug}` : baseUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
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
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(e) => onChange("slug", e.target.value)}
              placeholder="url-slug"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Canonical Path</Label>
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
          <Label htmlFor="metaTitle">Meta Title</Label>
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
          <Label htmlFor="metaDescription">Meta Description</Label>
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
          <Label htmlFor="ogTitle">Open Graph Title</Label>
          <Input
            id="ogTitle"
            value={values.ogTitle}
            onChange={(e) => onChange("ogTitle", e.target.value)}
            placeholder="OG title for social media"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ogDescription">Open Graph Description</Label>
          <Textarea
            id="ogDescription"
            value={values.ogDescription}
            onChange={(e) => onChange("ogDescription", e.target.value)}
            placeholder="OG description for social media"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="robots">Robots</Label>
            <Select value={values.robots} onValueChange={(value) => onChange("robots", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index, follow">Index, Follow</SelectItem>
                <SelectItem value="noindex, follow">NoIndex, Follow</SelectItem>
                <SelectItem value="index, nofollow">Index, NoFollow</SelectItem>
                <SelectItem value="noindex, nofollow">NoIndex, NoFollow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="changeFrequency">Change Frequency</Label>
            <Select value={values.changeFrequency} onValueChange={(value) => onChange("changeFrequency", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Always</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority (0.0-1.0)</Label>
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
          <Label htmlFor="structuredData">JSON-LD Structured Data (optional)</Label>
          <Textarea
            id="structuredData"
            value={values.structuredData}
            onChange={(e) => onChange("structuredData", e.target.value)}
            placeholder='{"@context": "https://schema.org", "@type": "Product", ...}'
            rows={6}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};