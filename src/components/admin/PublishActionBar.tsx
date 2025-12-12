import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, Save, Send, Clock, ChevronUp, EyeOff } from "lucide-react";

interface PublishActionBarProps {
  isPublished: boolean;
  isSaving: boolean;
  onSave: () => Promise<void>;
  onPublish: (publish: boolean, scheduledDate?: string) => Promise<void>;
  previewUrl?: string;
  hasChanges?: boolean;
}

export const PublishActionBar = ({
  isPublished,
  isSaving,
  onSave,
  onPublish,
  previewUrl,
  hasChanges = false,
}: PublishActionBarProps) => {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleSaveOnly = async () => {
    await onSave();
  };

  const handleSaveAndPreview = async () => {
    await onSave();
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  const handlePublishConfirm = async () => {
    await onPublish(true);
    setShowPublishDialog(false);
  };

  const handleUnpublish = async () => {
    await onPublish(false);
  };

  const handleScheduleConfirm = async () => {
    if (scheduledDate && scheduledTime) {
      const dateTime = `${scheduledDate}T${scheduledTime}:00`;
      await onPublish(true, dateTime);
      setShowScheduleDialog(false);
      setScheduledDate("");
      setScheduledTime("");
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        <div className="container max-w-6xl mx-auto px-3 md:px-4 py-2 md:py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              {isPublished ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Pubblicato
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Bozza
                </span>
              )}
              {hasChanges && (
                <span className="text-yellow-600 text-xs">• Modifiche non salvate</span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 md:pb-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveOnly}
                disabled={isSaving}
                className="shrink-0 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
              >
                <Save className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Salva</span>
              </Button>
              
              {previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAndPreview}
                  disabled={isSaving}
                  className="shrink-0 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
                >
                  <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">Salva e Anteprima</span>
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowScheduleDialog(true)}
                disabled={isSaving}
                className="shrink-0 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
              >
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Programma</span>
              </Button>
              
              {isPublished ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 shrink-0 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
                    >
                      <Send className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden md:inline">Ripubblica</span>
                      <ChevronUp className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1 md:ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="bg-background border shadow-lg">
                    <DropdownMenuItem 
                      onClick={() => setShowPublishDialog(true)}
                      className="cursor-pointer"
                    >
                      <Send className="h-4 w-4 mr-2 text-green-600" />
                      Ripubblica contenuto
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleUnpublish}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Rimuovi pubblicazione
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setShowPublishDialog(true)}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 shrink-0 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
                >
                  <Send className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">Pubblica</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Pubblicazione</DialogTitle>
            <DialogDescription>
              Stai per pubblicare questo contenuto. Una volta pubblicato, sarà visibile a tutti i visitatori del sito.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Send className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Sei sicuro di voler pubblicare?</p>
                <p className="text-sm text-muted-foreground">
                  Il contenuto sarà immediatamente disponibile online.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Annulla
            </Button>
            <Button 
              onClick={handlePublishConfirm} 
              className="bg-green-600 hover:bg-green-700"
              disabled={isSaving}
            >
              <Send className="h-4 w-4 mr-2" />
              Conferma Pubblicazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programma Pubblicazione</DialogTitle>
            <DialogDescription>
              Scegli la data e l'ora in cui vuoi che il contenuto venga pubblicato automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Data</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Ora</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Pubblicazione programmata</p>
                <p className="text-sm text-muted-foreground">
                  Il contenuto verrà pubblicato automaticamente alla data e ora selezionate.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Annulla
            </Button>
            <Button 
              onClick={handleScheduleConfirm}
              disabled={!scheduledDate || !scheduledTime || isSaving}
            >
              <Clock className="h-4 w-4 mr-2" />
              Programma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
