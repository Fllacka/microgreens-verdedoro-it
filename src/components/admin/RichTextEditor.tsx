import { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2, Unlink, Trash2 } from "lucide-react";
import { LinkDialog } from "./LinkDialog";
import { ImageDialog } from "./ImageDialog";
import { ResizableImage } from "./ResizableImage";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imageSize, setImageSize] = useState({ width: "", height: "" });

  const updateToolbarState = useCallback((editor: any) => {
    setIsLinkActive(editor.isActive("link"));
    const isImage = editor.isActive("image");
    setIsImageSelected(isImage);
    
    if (isImage) {
      const attrs = editor.getAttributes("image");
      setImageSize({
        width: attrs.width || "",
        height: attrs.height || "",
      });
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      updateToolbarState(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      updateToolbarState(editor);
    },
    onTransaction: ({ editor }) => {
      updateToolbarState(editor);
    },
    editorProps: {
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'A' || target.closest('a')) {
          event.preventDefault();
          event.stopPropagation();
          return true;
        }
        return false;
      },
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === 'A' || target.closest('a')) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleSetLink = (url: string, openInNewTab: boolean) => {
    if (openInNewTab) {
      editor.chain().focus().setLink({ href: url, target: "_blank", rel: "noopener noreferrer" }).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = (url: string, alt: string) => {
    editor.chain().focus().setImage({ src: url, alt }).run();
  };

  const updateImageSize = (dimension: "width" | "height", value: string) => {
    const numValue = value ? parseInt(value, 10) : null;
    setImageSize(prev => ({ ...prev, [dimension]: value }));
    
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { [dimension]: numValue }).run();
    }
  };

  const setPresetSize = (width: number) => {
    if (editor.isActive("image")) {
      setImageSize({ width: String(width), height: "" });
      editor.chain().focus().updateAttributes("image", { width, height: null }).run();
    }
  };

  const deleteImage = () => {
    if (editor.isActive("image")) {
      editor.chain().focus().deleteSelection().run();
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <LinkDialog
          isActive={isLinkActive}
          onSetLink={handleSetLink}
          onRemoveLink={handleRemoveLink}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={isLinkActive ? "bg-muted" : ""}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </LinkDialog>
        {isLinkActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveLink}
            title="Rimuovi link"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        )}
        <ImageDialog onSelectImage={addImage}>
          <Button type="button" variant="ghost" size="sm">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </ImageDialog>
      </div>
      
      {isImageSelected && (
        <div className="flex flex-wrap items-center gap-3 p-2 border-b bg-blue-50 dark:bg-blue-950/30">
          <span className="text-sm font-medium text-muted-foreground">Dimensioni:</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPresetSize(200)}
              className="h-7 px-2 text-xs"
            >
              Piccola
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPresetSize(400)}
              className="h-7 px-2 text-xs"
            >
              Media
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPresetSize(600)}
              className="h-7 px-2 text-xs"
            >
              Grande
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setImageSize({ width: "", height: "" });
                editor.chain().focus().updateAttributes("image", { width: null, height: null }).run();
              }}
              className="h-7 px-2 text-xs"
            >
              Auto
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">W:</Label>
            <Input
              type="number"
              value={imageSize.width}
              onChange={(e) => updateImageSize("width", e.target.value)}
              className="h-7 w-16 text-xs"
              placeholder="auto"
            />
            <Label className="text-xs">H:</Label>
            <Input
              type="number"
              value={imageSize.height}
              onChange={(e) => updateImageSize("height", e.target.value)}
              className="h-7 w-16 text-xs"
              placeholder="auto"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={deleteImage}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:pointer-events-auto [&_a]:cursor-text [&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-primary [&_.ProseMirror-selectednode]:outline-offset-2"
      />
    </div>
  );
};
