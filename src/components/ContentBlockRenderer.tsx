import { cn } from "@/lib/utils";
import { sanitizeRichTextHtml } from "@/lib/sanitize";

interface ContentBlock {
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
    rows: {
      content: string;
      isBold?: boolean;
      isHighlighted?: boolean;
    }[][];
    hasHeaderRow?: boolean;
  };
}

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export const ContentBlockRenderer = ({ blocks }: ContentBlockRendererProps) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const renderBlockTitle = (block: ContentBlock, centered = false) => {
    if (!block.title || !block.titleLevel) return null;

    const titleClasses = {
      h2: cn("font-display text-3xl md:text-4xl font-bold text-foreground mb-6", centered && "text-center"),
      h3: cn("font-display text-2xl md:text-3xl font-bold text-foreground mb-4", centered && "text-center"),
    };

    const TitleTag = block.titleLevel;
    return <TitleTag className={titleClasses[block.titleLevel]}>{block.title}</TitleTag>;
  };

  const proseClasses =
    "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_p]:my-4 [&_p]:min-h-[1.5em] [&_p:empty]:min-h-[1.5em] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg";

  const renderTextImageBlock = (block: ContentBlock) => {
    const position = block.imagePosition || "right";

    // Fixed image dimensions - always 500px height on desktop
    const imageElement = (
      <div className="relative w-full rounded-xl overflow-hidden shadow-lg h-[300px] md:h-[380px] lg:h-[500px]">
        <img
          src={block.url || ""}
          alt={block.alt || ""}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );

    const textContent = (
      <div className="flex flex-col justify-start py-4 md:py-6">
        <div
          className={cn("prose prose-lg max-w-none", proseClasses)}
          dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(block.content || "") }}
        />
      </div>
    );

    // Top/Bottom layout (stacked)
    if (position === "top" || position === "bottom") {
      return (
        <div key={block.id} className="mx-[2.5%]">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Title always on top, centered */}
            {renderBlockTitle(block, true)}
            {position === "top" ? (
              <>
                {block.url && imageElement}
                <div className="pt-4">
                  <div
                    className={cn("prose prose-lg max-w-none", proseClasses)}
                    dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(block.content || "") }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="pb-4">
                  <div
                    className={cn("prose prose-lg max-w-none", proseClasses)}
                    dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(block.content || "") }}
                  />
                </div>
                {block.url && imageElement}
              </>
            )}
          </div>
        </div>
      );
    }

    // Left/Right layout: Title on top centered, then side by side
    return (
      <div key={block.id} className="mx-[2.5%]">
        {/* Title always on top, centered - for all screen sizes */}
        {renderBlockTitle(block, true)}

        {/* Mobile layout: image then text */}
        <div className="lg:hidden space-y-6">
          {block.url && imageElement}
          <div
            className={cn("prose prose-lg max-w-none", proseClasses)}
            dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(block.content || "") }}
          />
        </div>

        {/* Desktop layout: side by side - image has fixed height, text can overflow */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
          {position === "left" ? (
            <>
              <div className="col-span-6 flex-shrink-0">{block.url && imageElement}</div>
              <div className="col-span-6">{textContent}</div>
            </>
          ) : (
            <>
              <div className="col-span-6">{textContent}</div>
              <div className="col-span-6 flex-shrink-0">{block.url && imageElement}</div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            const HeadingTag = block.level || "h2";
            const headingClasses = {
              h1: "font-display text-4xl md:text-5xl font-bold text-foreground mb-6 text-center",
              h2: "font-display text-3xl md:text-4xl font-bold text-foreground mb-6 text-center",
              h3: "font-display text-2xl md:text-3xl font-bold text-foreground mb-4 text-center",
            };
            return (
              <div key={block.id} className="max-w-4xl mx-auto px-4">
                <HeadingTag className={headingClasses[block.level || "h2"]}>{block.content}</HeadingTag>
              </div>
            );

          case "text":
            return (
              <div key={block.id} className="max-w-4xl mx-auto px-4 py-6 md:py-8">
                {renderBlockTitle(block, true)}
                <div
                  className={cn("prose prose-lg max-w-none", proseClasses)}
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(block.content || "") }}
                />
              </div>
            );

          case "image":
            return (
              <div key={block.id} className="max-w-4xl mx-auto px-4">
                <div className="relative w-full aspect-video rounded-2xl shadow-lg overflow-hidden">
                  <img
                    src={block.url || ""}
                    alt={block.alt || ""}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            );

          case "text-image":
            return renderTextImageBlock(block);
          case "table":
            return renderTableBlock(block);

          default:
            return null;
        }
      })}
    </div>
  );
  const renderTableBlock = (block: ContentBlock) => {
    const data = block.tableData;
    if (!data || !data.rows || data.rows.length === 0) return null;

    return (
      <div key={block.id} className="w-full max-w-6xl mx-auto px-4 py-8 overflow-hidden">
        {renderBlockTitle(block, true)}
        <div className="relative overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full border-collapse bg-[#FDFBF7] text-left">
            <thead>
              <tr className="bg-[#1A3C34] text-white">
                {data.rows[0].map((cell, i) => (
                  <th
                    key={i}
                    className={cn(
                      "p-4 text-sm font-bold border-b border-white/10 whitespace-nowrap",
                      i === 0 && "sticky left-0 z-10 bg-[#1A3C34]",
                    )}
                  >
                    {cell.content}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border last:border-0 hover:bg-black/5 transition-colors">
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        "p-4 text-sm transition-all",
                        colIndex === 0 && "sticky left-0 z-10 bg-[#FDFBF7] font-medium border-r",
                        cell.isBold && "font-bold",
                        cell.isHighlighted && "ring-2 ring-inset ring-amber-400/40 bg-amber-50/50",
                      )}
                    >
                      {cell.content}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="md:hidden text-center text-[10px] text-muted-foreground mt-2 italic">
          ← Scorri lateralmente per vedere tutti i dati →
        </p>
      </div>
    );
  };
};
