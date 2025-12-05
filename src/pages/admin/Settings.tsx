import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Image, Info } from "lucide-react";

const Settings = () => {
  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select(`
          logo_id,
          media:logo_id (
            file_path
          )
        `)
        .eq("id", "default")
        .single();

      if (error) throw error;

      if (data) {
        setLogoId(data.logo_id);
        if (data.media && typeof data.media === 'object' && 'file_path' in data.media) {
          setLogoUrl(data.media.file_path as string);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Errore nel caricamento delle impostazioni");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (imageId: string | null, imageUrl: string | null) => {
    setLogoId(imageId);
    setLogoUrl(imageUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ logo_id: logoId })
        .eq("id", "default");

      if (error) throw error;

      toast.success("Impostazioni salvate con successo");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Impostazioni Sito
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura le impostazioni generali del sito
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvataggio..." : "Salva"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Logo del Sito
            </CardTitle>
            <CardDescription>
              Carica il logo che apparirà nella navigazione e nel footer del sito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Requisiti del logo:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Formato:</strong> PNG con sfondo trasparente (consigliato)</li>
                  <li><strong>Dimensioni consigliate:</strong> 400-600px di larghezza, altezza proporzionale</li>
                  <li><strong>Altezza massima visualizzata:</strong> 56px nella navigazione desktop, 40px su mobile</li>
                  <li><strong>Proporzioni ideali:</strong> Orizzontale (3:1 o 4:1) o quadrato (1:1)</li>
                  <li><strong>Sfondo:</strong> Deve essere trasparente per adattarsi a tutti i temi</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Seleziona o Carica Logo</Label>
              <MediaSelector
                value={logoId}
                onChange={handleLogoChange}
                showAltText={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;