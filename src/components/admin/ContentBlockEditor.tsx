import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "./RichTextEditor";
import { ImageDialog } from "./ImageDialog";
import {
  Plus,
  Trash2,
  GripVertical,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  Replace,
  LayoutTemplate,
  X,
} from "lucide-react";
export interface TableCell {
  content: string;
  isBold?: boolean;
  isHighlighted?: boolean;
}
export interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image" | "text-image" | "table";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
  imagePosition?: "top" | "bottom" | "left" | "right";
  imageAspectRatio?: "1/1" | "4/3" | "16/9" | "3/4";
  title?: string;
  titleLevel?: "h2" | "h3";
  tableData?: {
    rows: TableCell[][];
    hasHeaderRow?: boolean;
  };
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
      ...(type === "table" && {
        tableData: {
          rows: [
            [
              { content: "Varietà", isBold: true },
              { content: "Valore", isBold: true },
            ],
            [{ content: "" }, { content: "" }],
          ],
          hasHeaderRow: true,
        },
      }),
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
      case "heading":
        return "Titolo";
      case "text":
        return "Testo";
      case "image":
        return "Immagine";
      case "text-image":
        return "Testo + Immagine";
      default:
        return type;
    }
  };

  const renderImageControls = (block: ContentBlock, isMobile: boolean = false, aspectRatio: number = 16 / 9) => {
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
            <ImageDialog onSelectImage={(url, alt) => handleImageSelect(block.id, url, alt)} aspectRatio={aspectRatio}>
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
        <ImageDialog onSelectImage={(url, alt) => handleImageSelect(block.id, url, alt)} aspectRatio={aspectRatio}>
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
        {/* Optional title */}
        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3 items-end`}>
          <div className={isMobile ? "w-full" : "w-24"}>
            <Label className="text-xs text-muted-foreground">Titolo (opz.)</Label>
            <Select
              value={block.titleLevel || "none"}
              onValueChange={(value) =>
                updateBlock(block.id, { titleLevel: value === "none" ? undefined : (value as "h2" | "h3") })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Nessuno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuno</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {block.titleLevel && (
            <div className="flex-1">
              <Input
                value={block.title || ""}
                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                placeholder="Inserisci titolo sezione"
                className="h-8"
              />
            </div>
          )}
        </div>

        {/* Position and aspect ratio selectors */}
        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3`}>
          <div className={isMobile ? "w-full" : "w-40"}>
            <Label className="text-xs text-muted-foreground">Posizione Immagine</Label>
            <Select
              value={block.imagePosition || "right"}
              onValueChange={(value) =>
                updateBlock(block.id, { imagePosition: value as ContentBlock["imagePosition"] })
              }
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
        </div>

        {/* Compact image section */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Immagine</Label>
          {renderImageControls(block, isMobile, 3 / 4)}
        </div>

        {/* Rich text content */}
        <div>
          <Label className="text-xs text-muted-foreground">Contenuto Testuale</Label>
          <RichTextEditor content={block.content || ""} onChange={(content) => updateBlock(block.id, { content })} />
        </div>
      </div>
    );
  };
  const renderTableEditor = (block: ContentBlock, isMobile: boolean = false) => {
    const data = block.tableData || { rows: [[{ content: "" }]], hasHeaderRow: true };
    const rows = data.rows;

    const updateTable = (newRows: TableCell[][]) => {
      updateBlock(block.id, { tableData: { ...data, rows: newRows } });
    };

    const addRow = () => {
      const colCount = rows[0]?.length || 1;
      const newRow = Array(colCount)
        .fill(null)
        .map(() => ({ content: "" }));
      updateTable([...rows, newRow]);
    };

    const addColumn = () => {
      const newRows = rows.map((row) => [...row, { content: "" }]);
      updateTable(newRows);
    };

    const removeRow = (rowIndex: number) => {
      if (rows.length <= 1) return;
      updateTable(rows.filter((_, i) => i !== rowIndex));
    };

    const removeColumn = (colIndex: number) => {
      if (rows[0].length <= 1) return;
      const newRows = rows.map((row) => row.filter((_, i) => i !== colIndex));
      updateTable(newRows);
    };

    const toggleCellFormat = (rowIndex: number, colIndex: number, field: "isBold" | "isHighlighted") => {
      const newRows = [...rows];
      newRows[rowIndex][colIndex] = {
        ...newRows[rowIndex][colIndex],
        [field]: !newRows[rowIndex][colIndex][field],
      };
      updateTable(newRows);
    };

    return (
      <div className="space-y-4 border rounded-lg p-2 md:p-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-verde-primary uppercase tracking-wider">
            Editor Tabella Nutrizionale
          </Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addRow} className="h-7 text-[10px]">
              <Plus className="h-3 w-3 mr-1" /> Riga
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addColumn} className="h-7 text-[10px]">
              <Plus className="h-3 w-3 mr-1" /> Col
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-md bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/20">
                <th className="w-8 border-b"></th>
                {rows[0].map((_, i) => (
                  <th key={i} className="p-1 border-b border-r text-[10px]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColumn(i)}
                      className="h-4 w-4 p-0 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 && data.hasHeaderRow ? "bg-verde-light/5" : ""}>
                  <td className="p-1 border-r text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(rowIndex)}
                      className="h-4 w-4 p-0 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-1 border-r border-b min-w-[120px] relative group ${cell.isHighlighted ? "ring-2 ring-inset ring-amber-400/50" : ""}`}
                    >
                      <Input
                        value={cell.content}
                        className={`h-8 text-xs border-none focus-visible:ring-1 ${cell.isBold ? "font-bold" : ""}`}
                        onChange={(e) => {
                          const newRows = [...rows];
                          newRows[rowIndex][colIndex].content = e.target.value;
                          updateTable(newRows);
                        }}
                      />
                      <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded px-1">
                        <button
                          onClick={() => toggleCellFormat(rowIndex, colIndex, "isBold")}
                          className={`text-[10px] font-bold px-1 ${cell.isBold ? "text-verde-primary" : "text-muted-foreground"}`}
                        >
                          B
                        </button>
                        <button
                          onClick={() => toggleCellFormat(rowIndex, colIndex, "isHighlighted")}
                          className={`text-[10px] px-1 ${cell.isHighlighted ? "text-amber-600" : "text-muted-foreground"}`}
                        >
                          ✨
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Mobile-friendly add block buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock("heading")}
          className="flex-1 min-w-[70px] sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Titolo</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock("text")}
          className="flex-1 min-w-[70px] sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Testo</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock("image")}
          className="flex-1 min-w-[70px] sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Immagine</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock("text-image")}
          className="flex-1 min-w-[100px] sm:flex-none bg-verde-light/10 border-verde-primary/30 hover:bg-verde-light/20"
        >
          <LayoutTemplate className="h-4 w-4 mr-1" />
          <span className="text-xs">Testo + Img</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock("table")}
          className="flex-1 min-w-[70px] sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Tabella</span>
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
                    <div className="space-y-4">
                      {/* Optional title */}
                      <div className="flex gap-3 items-end">
                        <div className="w-24">
                          <Label className="text-xs text-muted-foreground">Titolo (opz.)</Label>
                          <Select
                            value={block.titleLevel || "none"}
                            onValueChange={(value) =>
                              updateBlock(block.id, {
                                titleLevel: value === "none" ? undefined : (value as "h2" | "h3"),
                              })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Nessuno" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nessuno</SelectItem>
                              <SelectItem value="h2">H2</SelectItem>
                              <SelectItem value="h3">H3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {block.titleLevel && (
                          <div className="flex-1">
                            <Input
                              value={block.title || ""}
                              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                              placeholder="Inserisci titolo sezione"
                              className="h-8"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Contenuto</Label>
                        <RichTextEditor
                          content={block.content || ""}
                          onChange={(content) => updateBlock(block.id, { content })}
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground">Immagine Singola</Label>
                      {renderImageControls(block, false)}
                    </div>
                  )}

                  {block.type === "text-image" && renderTextImageBlock(block, false)}
                  {block.type === "table" && renderTableEditor(block, false)}
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
                  <div className="space-y-3">
                    {/* Optional title */}
                    <div className="space-y-2">
                      <Label className="text-xs">Titolo (opzionale)</Label>
                      <div className="flex gap-2">
                        <Select
                          value={block.titleLevel || "none"}
                          onValueChange={(value) =>
                            updateBlock(block.id, { titleLevel: value === "none" ? undefined : (value as "h2" | "h3") })
                          }
                        >
                          <SelectTrigger className="h-8 w-20">
                            <SelectValue placeholder="No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No</SelectItem>
                            <SelectItem value="h2">H2</SelectItem>
                            <SelectItem value="h3">H3</SelectItem>
                          </SelectContent>
                        </Select>
                        {block.titleLevel && (
                          <Input
                            value={block.title || ""}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            placeholder="Titolo"
                            className="h-8 flex-1"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Contenuto</Label>
                      <RichTextEditor
                        content={block.content || ""}
                        onChange={(content) => updateBlock(block.id, { content })}
                      />
                    </div>
                  </div>
                )}

                {block.type === "image" && <div className="space-y-3">{renderImageControls(block, true)}</div>}

                {block.type === "text-image" && renderTextImageBlock(block, true)}
                {block.type === "table" && renderTableEditor(block, true)}
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
