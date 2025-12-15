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
    
    const imageElement = block.url && (
      <div className={`w-full ${position === "left" || position === "right" ? "lg:w-1/2" : ""}`}>
        <img
          src={block.url}
          alt={block.alt || ""}
          className={`w-full ${aspectClass} object-cover rounded-xl shadow-lg`}
          loading="lazy"
          decoding="async"
          width={600}
          height={400}
        />
      </div>
    );

    const textElement = (
      <div className={`w-full ${position === "left" || position === "right" ? "lg:w-1/2" : ""}`}>
        <div
          className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2"
          dangerouslySetInnerHTML={{ __html: block.content || "" }}
        />
      </div>
    );

    // Top/Bottom layout (stacked)
    if (position === "top" || position === "bottom") {
      return (
        <div key={block.id} className="space-y-6">
          {renderBlockTitle(block)}
          {position === "top" ? (
            <>
              {imageElement}
              {textElement}
            </>
          ) : (
            <>
              {textElement}
              {imageElement}
            </>
          )}
        </div>
      );
    }

    // Left/Right layout (side by side on desktop, stacked on mobile)
    return (
      <div key={block.id}>
        {renderBlockTitle(block)}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
          {position === "left" ? (
            <>
              {imageElement}
              {textElement}
            </>
          ) : (
            <>
              <div className="order-2 lg:order-1 w-full lg:w-1/2">
                <div
                  className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2"
                  dangerouslySetInnerHTML={{ __html: block.content || "" }}
                />
              </div>
              <div className="order-1 lg:order-2 w-full lg:w-1/2">
                {block.url && (
                  <img
                    src={block.url}
                    alt={block.alt || ""}
                    className={`w-full ${aspectClass} object-cover rounded-xl shadow-lg`}
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={400}
                  />
                )}
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
                  className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-4 [&_img[data-align=left]]:mb-2 [&_img[data-align=center]]:mx-auto [&_img[data-align=center]]:block [&_img[data-align=center]]:float-none [&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-4 [&_img[data-align=right]]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2"
                  dangerouslySetInnerHTML={{ __html: block.content || "" }}
                />
              </div>
            );

          case "image":
            return (
              <div key={block.id} className="my-8">
                <img
                  src={block.url}
                  alt={block.alt || ""}
                  className="w-full rounded-xl shadow-lg"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={450}
                />
                {block.alt && (
                  <p className="text-sm text-muted-foreground text-center mt-3">{block.alt}</p>
                )}
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
