import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2, Unlink } from "lucide-react";
import { LinkDialog } from "./LinkDialog";
import { ImageDialog } from "./ImageDialog";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [isLinkActive, setIsLinkActive] = useState(false);

  const updateToolbarState = useCallback((editor: any) => {
    setIsLinkActive(editor.isActive("link"));
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
      Image,
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
        // Prevent link navigation
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
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:pointer-events-auto [&_a]:cursor-text"
      />
    </div>
  );
};