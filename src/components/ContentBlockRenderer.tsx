import OptimizedImage from "@/components/ui/optimized-image";

interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image" | "text-image";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
  imagePosition?: "top" | "bottom" | "left" | "right";
  imageAspectRatio?: "1/1" | "4/3" | "16/9" | "3/4";
  title?: string;
  titleLevel?: "h2" | "h3";
}

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export const ContentBlockRenderer = ({ blocks }: ContentBlockRendererProps) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const sanitizeRichTextHtml = (html: string) => {
    if (!html) return "";

    // Remove the literal sequence "\00a0" if it exists in saved content.
    const withoutLiteral = html.replace(/\\00a0/g, "");

    // If a paragraph only contains a nbsp, keep the paragraph but remove the visible char.
    return withoutLiteral.replace(/<p>\s*(?:&nbsp;|\u00a0)\s*<\/p>/g, "<p></p>");
  };

  const getAspectRatioClass = (ratio?: string) => {
    switch (ratio) {
      case "1/1": return "aspect-square";
      case "4/3": return "aspect-[4/3]";
      case "16/9": return "aspect-video";
      case "3/4": return "aspect-[3/4]";
      default: return "aspect-[4/3]";
    }
  };

  const renderBlockTitle = (block: ContentBlock) => {
    if (!block.title || !block.titleLevel) return null;
    
    const titleClasses = {
      h2: "font-display text-3xl md:text-4xl font-bold text-foreground mb-6",
      h3: "font-display text-2xl md:text-3xl font-bold text-foreground mb-4",
    };
    
    const TitleTag = block.titleLevel;
    return <TitleTag className={titleClasses[block.titleLevel]}>{block.title}</TitleTag>;
  };

  const renderTextImageBlock = (block: ContentBlock) => {
    const position = block.imagePosition || "right";
    const aspectClass = getAspectRatioClass(block.imageAspectRatio);
    
    const imageElement = (
      <OptimizedImage
        src={block.url || ""}
        alt={block.alt || ""}
        className="w-full h-full"
        containerClassName={`w-full ${aspectClass} rounded-xl shadow-lg overflow-hidden`}
        objectFit="cover"
        size="large"
        context="full"
      />
    );

    const textContent = (
      <div
        className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_p]:my-4 [&_p]:min-h-[1.5em] [&_p:empty]:min-h-[1.5em] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
        dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(block.content || "") }}
      />
    );

    // Top/Bottom layout (stacked) - same on mobile and desktop
    if (position === "top" || position === "bottom") {
      return (
        <div key={block.id} className="space-y-6">
          {position === "top" ? (
            <>
              {renderBlockTitle(block)}
              {block.url && imageElement}
              {textContent}
            </>
          ) : (
            <>
              {renderBlockTitle(block)}
              {textContent}
              {block.url && imageElement}
            </>
          )}
        </div>
      );
    }

    // Left/Right layout: side by side on desktop, title-image-text stacked on mobile
    return (
      <div key={block.id}>
        {/* Mobile layout: Title first, then image, then text */}
        <div className="lg:hidden space-y-4">
          {renderBlockTitle(block)}
          {block.url && imageElement}
          {textContent}
        </div>
        
        {/* Desktop layout: side by side with title inside text column */}
        <div className="hidden lg:flex lg:flex-row gap-12 items-start">
          {position === "left" ? (
            <>
              <div className="w-1/2">
                {block.url && imageElement}
              </div>
              <div className="w-1/2">
                {renderBlockTitle(block)}
                {textContent}
              </div>
            </>
          ) : (
            <>
              <div className="w-1/2">
                {renderBlockTitle(block)}
                {textContent}
              </div>
              <div className="w-1/2">
                {block.url && imageElement}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            const HeadingTag = block.level || "h2";
            const headingClasses = {
              h1: "font-display text-4xl md:text-5xl font-bold text-foreground mb-6",
              h2: "font-display text-3xl md:text-4xl font-bold text-foreground mb-6",
              h3: "font-display text-2xl md:text-3xl font-bold text-foreground mb-4",
            };
            return (
              <HeadingTag key={block.id} className={headingClasses[block.level || "h2"]}>
                {block.content}
              </HeadingTag>
            );

          case "text":
            return (
              <div key={block.id}>
                {renderBlockTitle(block)}
                <div
                  className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_p]:my-4 [&_p]:min-h-[1.5em] [&_p:empty]:min-h-[1.5em] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-4 [&_img[data-align=left]]:mb-2 [&_img[data-align=center]]:mx-auto [&_img[data-align=center]]:block [&_img[data-align=center]]:float-none [&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-4 [&_img[data-align=right]]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(block.content || "") }}
                />
              </div>
            );

          case "image":
            return (
              <div key={block.id} className="my-8">
                <OptimizedImage
                  src={block.url || ""}
                  alt={block.alt || ""}
                  className="w-full h-full"
                  containerClassName="w-full aspect-video rounded-xl shadow-lg overflow-hidden"
                  objectFit="cover"
                  size="large"
                  context="full"
                />
              </div>
            );

          case "text-image":
            return renderTextImageBlock(block);

          default:
            return null;
        }
      })}
    </div>
  );
};
