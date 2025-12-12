import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "./RichTextEditor";
import { ImageDialog } from "./ImageDialog";
import { Plus, Trash2, GripVertical, MoveUp, MoveDown, Image as ImageIcon, Replace } from "lucide-react";

export interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
}

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export const ContentBlockEditor = ({ blocks, onChange }: ContentBlockEditorProps) => {
  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      ...(type === "heading" && { level: "h2", content: "" }),
      ...(type === "text" && { content: "" }),
      ...(type === "image" && { url: "", alt: "" }),
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const handleImageSelect = (blockId: string, url: string, alt: string) => {
    updateBlock(blockId, { url, alt });
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Mobile-friendly add block buttons */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("heading")} className="flex-1 min-w-[80px] sm:flex-none">
          <Plus className="h-4 w-4 mr-1 md:mr-2" />
          <span className="text-xs md:text-sm">Titolo</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("text")} className="flex-1 min-w-[80px] sm:flex-none">
          <Plus className="h-4 w-4 mr-1 md:mr-2" />
          <span className="text-xs md:text-sm">Testo</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("image")} className="flex-1 min-w-[80px] sm:flex-none">
          <Plus className="h-4 w-4 mr-1 md:mr-2" />
          <span className="text-xs md:text-sm">Immagine</span>
        </Button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {blocks.map((block, index) => (
          <Card key={block.id} className="relative">
            <CardContent className="p-3 md:pt-6 md:p-6">
              {/* Mobile: Action bar at top */}
              <div className="flex items-center justify-between gap-2 mb-3 md:hidden">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => moveBlock(block.id, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => moveBlock(block.id, "down")}
                    disabled={index === blocks.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground capitalize ml-2">{block.type}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => deleteBlock(block.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Desktop: Original side controls */}
              <div className="hidden md:flex items-start gap-2">
                <div className="flex flex-col gap-1 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => moveBlock(block.id, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => moveBlock(block.id, "down")}
                    disabled={index === blocks.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  {block.type === "heading" && (
                    <div className="flex gap-4">
                      <div className="w-32">
                        <Label>Livello</Label>
                        <Select
                          value={block.level}
                          onValueChange={(value) => updateBlock(block.id, { level: value as "h1" | "h2" | "h3" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="h1">H1</SelectItem>
                            <SelectItem value="h2">H2</SelectItem>
                            <SelectItem value="h3">H3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label>Testo Titolo</Label>
                        <Input
                          value={block.content || ""}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Inserisci il titolo"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "text" && (
                    <div>
                      <Label>Contenuto</Label>
                      <RichTextEditor
                        content={block.content || ""}
                        onChange={(content) => updateBlock(block.id, { content })}
                      />
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="space-y-4">
                      {block.url ? (
                        <div className="space-y-4">
                          <img 
                            src={block.url} 
                            alt={block.alt || ""} 
                            className="max-w-md rounded-lg border shadow-sm" 
                          />
                          <ImageDialog onSelectImage={(url, alt) => handleImageSelect(block.id, url, alt)}>
                            <Button type="button" variant="outline" size="sm">
                              <Replace className="h-4 w-4 mr-2" />
                              Sostituisci Immagine
                            </Button>
                          </ImageDialog>
                          <div>
                            <Label>Testo Alternativo (Alt)</Label>
                            <Input
                              value={block.alt || ""}
                              onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                              placeholder="Descrizione dell'immagine per SEO e accessibilità"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-4">Nessuna immagine selezionata</p>
                          <ImageDialog onSelectImage={(url, alt) => handleImageSelect(block.id, url, alt)}>
                            <Button type="button" variant="outline">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Seleziona Immagine
                            </Button>
                          </ImageDialog>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteBlock(block.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile: Content area */}
              <div className="md:hidden space-y-3">
                {block.type === "heading" && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Livello</Label>
                      <Select
                        value={block.level}
                        onValueChange={(value) => updateBlock(block.id, { level: value as "h1" | "h2" | "h3" })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h1">H1</SelectItem>
                          <SelectItem value="h2">H2</SelectItem>
                          <SelectItem value="h3">H3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Testo Titolo</Label>
                      <Input
                        value={block.content || ""}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Inserisci il titolo"
                        className="h-9"
                      />
                    </div>
                  </div>
                )}

                {block.type === "text" && (
                  <div>
                    <Label className="text-xs">Contenuto</Label>
                    <RichTextEditor
                      content={block.content || ""}
                      onChange={(content) => updateBlock(block.id, { content })}
                    />
                  </div>
                )}

                {block.type === "image" && (
                  <div className="space-y-3">
                    {block.url ? (
                      <>
                        <img 
                          src={block.url} 
                          alt={block.alt || ""} 
                          className="w-full rounded-lg border shadow-sm" 
                        />
                        <ImageDialog onSelectImage={(url, alt) => handleImageSelect(block.id, url, alt)}>
                          <Button type="button" variant="outline" size="sm" className="w-full">
                            <Replace className="h-4 w-4 mr-2" />
                            Sostituisci
                          </Button>
                        </ImageDialog>
                        <div>
                          <Label className="text-xs">Testo Alt</Label>
                          <Input
                            value={block.alt || ""}
                            onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                            placeholder="Descrizione immagine"
                            className="h-9"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <ImageDialog onSelectImage={(url, alt) => handleImageSelect(block.id, url, alt)}>
                          <Button type="button" variant="outline" size="sm">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Seleziona
                          </Button>
                        </ImageDialog>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {blocks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No content blocks yet. Add your first block above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
