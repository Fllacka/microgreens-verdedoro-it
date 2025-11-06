import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "./RichTextEditor";
import { Plus, Trash2, GripVertical, MoveUp, MoveDown } from "lucide-react";

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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("heading")}>
          <Plus className="h-4 w-4 mr-2" />
          Heading
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("text")}>
          <Plus className="h-4 w-4 mr-2" />
          Text
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock("image")}>
          <Plus className="h-4 w-4 mr-2" />
          Image
        </Button>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <Card key={block.id} className="relative">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
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
                    <>
                      <div className="flex gap-4">
                        <div className="w-32">
                          <Label>Level</Label>
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
                          <Label>Heading Text</Label>
                          <Input
                            value={block.content || ""}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            placeholder="Enter heading text"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {block.type === "text" && (
                    <div>
                      <Label>Content</Label>
                      <RichTextEditor
                        content={block.content || ""}
                        onChange={(content) => updateBlock(block.id, { content })}
                      />
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={block.url || ""}
                          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <Label>Alt Text</Label>
                        <Input
                          value={block.alt || ""}
                          onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                          placeholder="Describe the image"
                        />
                      </div>
                      {block.url && (
                        <img src={block.url} alt={block.alt} className="max-w-md rounded border" />
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
