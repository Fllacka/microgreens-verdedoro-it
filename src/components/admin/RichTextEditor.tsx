import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2, Heading3, Heading4, Unlink, Trash2, AlignLeft, AlignCenter, AlignRight, Replace } from "lucide-react";
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
  const [imageAlign, setImageAlign] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState("");

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
      setImageAlign(attrs.align || null);
      setImageAlt(attrs.alt || "");
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

  const replaceImage = (url: string, alt: string) => {
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { src: url, alt }).run();
      setImageAlt(alt);
    }
  };

  const updateImageAlt = (alt: string) => {
    setImageAlt(alt);
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { alt }).run();
    }
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

  const setAlignment = (align: string | null) => {
    if (editor.isActive("image")) {
      setImageAlign(align);
      editor.chain().focus().updateAttributes("image", { align }).run();
    }
  };

  const deleteImage = () => {
    if (editor.isActive("image")) {
      editor.chain().focus().deleteSelection().run();
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="flex gap-1 p-2 border-b bg-muted/50 overflow-x-auto">
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive("heading", { level: 4 }) ? "bg-muted" : ""}
        >
          <Heading4 className="h-4 w-4" />
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
        <div className="flex items-center gap-2 md:gap-3 p-2 border-b bg-blue-50 dark:bg-blue-950/30 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Label className="text-xs whitespace-nowrap">Alt:</Label>
            <Input
              type="text"
              value={imageAlt}
              onChange={(e) => updateImageAlt(e.target.value)}
              className="h-7 w-28 md:w-40 text-xs"
              placeholder="Testo alternativo"
            />
          </div>
          
          <ImageDialog onSelectImage={replaceImage}>
            <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs">
              <Replace className="h-3 w-3 mr-1" />
              Sostituisci
            </Button>
          </ImageDialog>
          
          <div className="h-6 w-px bg-border shrink-0 hidden md:block" />
          
          <span className="text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0 hidden md:inline">Dimensioni:</span>
          <div className="flex items-center gap-1 shrink-0">
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
          <div className="flex items-center gap-2 shrink-0 hidden md:flex">
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
          
          <div className="h-6 w-px bg-border shrink-0 hidden md:block" />
          
          <span className="text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0 hidden md:inline">Allineamento:</span>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAlignment("left")}
              className={`h-7 w-7 p-0 ${imageAlign === "left" ? "bg-muted border-primary" : ""}`}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAlignment("center")}
              className={`h-7 w-7 p-0 ${imageAlign === "center" ? "bg-muted border-primary" : ""}`}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAlignment("right")}
              className={`h-7 w-7 p-0 ${imageAlign === "right" ? "bg-muted border-primary" : ""}`}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={deleteImage}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-3 md:p-4 min-h-[200px] md:min-h-[300px] focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:pointer-events-auto [&_a]:cursor-text [&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-primary [&_.ProseMirror-selectednode]:outline-offset-2 [&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-4 [&_img[data-align=left]]:mb-2 [&_img[data-align=center]]:mx-auto [&_img[data-align=center]]:block [&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-4 [&_img[data-align=right]]:mb-2"
      />
    </div>
  );
};
