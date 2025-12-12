interface ContentBlock {
  id: string;
  type: "heading" | "text" | "image";
  level?: "h1" | "h2" | "h3";
  content?: string;
  url?: string;
  alt?: string;
}

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export const ContentBlockRenderer = ({ blocks }: ContentBlockRendererProps) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
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
              <div
                key={block.id}
                className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-4 [&_img[data-align=left]]:mb-2 [&_img[data-align=center]]:mx-auto [&_img[data-align=center]]:block [&_img[data-align=center]]:float-none [&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-4 [&_img[data-align=right]]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2"
                dangerouslySetInnerHTML={{ __html: block.content || "" }}
              />
            );

          case "image":
            return (
              <div key={block.id} className="my-8">
                <img
                  src={block.url}
                  alt={block.alt || ""}
                  className="w-full rounded-lg shadow-soft"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={450}
                />
                {block.alt && (
                  <p className="text-sm text-muted-foreground text-center mt-2">{block.alt}</p>
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
