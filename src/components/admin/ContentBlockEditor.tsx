import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "./RichTextEditor";
import { ImageDialog } from "./ImageDialog";
import { Plus, Trash2, GripVertical, MoveUp, MoveDown, Image as ImageIcon, Replace, LayoutTemplate, X } from "lucide-react";

export interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image" | "text-image";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
  imagePosition?: "top" | "bottom" | "left" | "right";
  imageAspectRatio?: "1/1" | "4/3" | "16/9" | "3/4";
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
      ...(type === "text-image" && { content: "", url: "", alt: "", imagePosition: "right", imageAspectRatio: "4/3" }),
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

  const getBlockTypeLabel = (type: ContentBlock["type"]) => {
    switch (type) {
      case "heading": return "Titolo";
      case "text": return "Testo";
      case "image": return "Immagine";
      case "text-image": return "Testo + Immagine";
      default: return type;
    }
  };

  const renderImageControls = (block: ContentBlock, isMobile: boolean = false) => {
    const sizeClasses = isMobile ? "w-16 h-16" : "w-20 h-20";
    const inputClasses = isMobile ? "h-8 text-xs" : "h-9";
    
    if (block.url) {
      return (
        <div className="flex items-start gap-3">
          {/* Compact thumbnail */}
          <div className={`${sizeClasses} flex-shrink-0 relative group`}>
            <img 
              src={block.url} 
              alt={block.alt || ""} 
              className="w-full h-full object-cover rounded-lg border shadow-sm" 
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => updateBlock(block.id, { url: "", alt: "" })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Alt text and replace inline */}
          <div className="flex-1 space-y-2">
            <Input
              value={block.alt || ""}
              onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
              placeholder="Alt: Descrizione per SEO"
              className={inputClasses}
            />
            <ImageDialog onSelectImage={(url, alt) => handleImageSelect(block.id, url, alt)}>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
                <Replace className="h-3 w-3 mr-1" />
                Sostituisci
              </Button>
            </ImageDialog>
          </div>
        </div>
      );
    }
    
    return (
      <div className="border-2 border-dashed rounded-lg p-4 text-center">
        <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
        <ImageDialog onSelectImage={(url, alt) => handleImageSelect(block.id, url, alt)}>
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-1" />
            Seleziona
          </Button>
        </ImageDialog>
      </div>
    );
  };

  const renderTextImageBlock = (block: ContentBlock, isMobile: boolean = false) => {
    return (
      <div className="space-y-4">
        {/* Position and aspect ratio selectors */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
          <div className={isMobile ? 'w-full' : 'w-40'}>
            <Label className="text-xs text-muted-foreground">Posizione Immagine</Label>
            <Select
              value={block.imagePosition || "right"}
              onValueChange={(value) => updateBlock(block.id, { imagePosition: value as ContentBlock["imagePosition"] })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">A sinistra</SelectItem>
                <SelectItem value="right">A destra</SelectItem>
                <SelectItem value="top">In alto</SelectItem>
                <SelectItem value="bottom">In basso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={isMobile ? 'w-full' : 'w-40'}>
            <Label className="text-xs text-muted-foreground">Formato Immagine</Label>
            <Select
              value={block.imageAspectRatio || "4/3"}
              onValueChange={(value) => updateBlock(block.id, { imageAspectRatio: value as ContentBlock["imageAspectRatio"] })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1/1">Quadrato (1:1)</SelectItem>
                <SelectItem value="4/3">Orizzontale (4:3)</SelectItem>
                <SelectItem value="16/9">Widescreen (16:9)</SelectItem>
                <SelectItem value="3/4">Verticale (3:4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compact image section */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Immagine</Label>
          {renderImageControls(block, isMobile)}
        </div>

        {/* Rich text content */}
        <div>
          <Label className="text-xs text-muted-foreground">Contenuto Testuale</Label>
          <RichTextEditor
            content={block.content || ""}
            onChange={(content) => updateBlock(block.id, { content })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Mobile-friendly add block buttons */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("heading")} className="flex-1 min-w-[70px] sm:flex-none">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Titolo</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("text")} className="flex-1 min-w-[70px] sm:flex-none">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Testo</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("image")} className="flex-1 min-w-[70px] sm:flex-none">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Immagine</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("text-image")} className="flex-1 min-w-[100px] sm:flex-none bg-verde-light/10 border-verde-primary/30 hover:bg-verde-light/20">
          <LayoutTemplate className="h-4 w-4 mr-1" />
          <span className="text-xs">Testo + Img</span>
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
                  <span className="text-xs text-muted-foreground ml-2">{getBlockTypeLabel(block.type)}</span>
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
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground">Immagine Singola</Label>
                      {renderImageControls(block, false)}
                    </div>
                  )}

                  {block.type === "text-image" && renderTextImageBlock(block, false)}
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
                    {renderImageControls(block, true)}
                  </div>
                )}

                {block.type === "text-image" && renderTextImageBlock(block, true)}
              </div>
            </CardContent>
          </Card>
        ))}

        {blocks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nessun blocco di contenuto. Aggiungi il primo blocco sopra.</p>
          </div>
        )}
      </div>
    </div>
  );
};
