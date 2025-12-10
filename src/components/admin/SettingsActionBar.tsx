import { Button } from "@/components/ui/button";
import { Save, Eye, Check } from "lucide-react";

interface SettingsActionBarProps {
  isSaving: boolean;
  onSave: () => Promise<void>;
  hasChanges?: boolean;
  lastSaved?: Date | null;
}

export const SettingsActionBar = ({
  isSaving,
  onSave,
  hasChanges = false,
  lastSaved,
}: SettingsActionBarProps) => {
  const handleSave = async () => {
    await onSave();
  };

  const handleSaveAndPreview = async () => {
    await onSave();
    window.open("/", "_blank");
  };

  const formatLastSaved = (date: Date) => {
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg md:left-64">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Impostazioni Attive
            </span>
            {hasChanges && (
              <span className="text-yellow-600">• Modifiche non salvate</span>
            )}
            {lastSaved && !hasChanges && (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-3 w-3" />
                Salvato alle {formatLastSaved(lastSaved)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveAndPreview}
              disabled={isSaving}
            >
              <Eye className="h-4 w-4 mr-2" />
              Salva e Anteprima
            </Button>
            
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvataggio..." : "Salva Impostazioni"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
