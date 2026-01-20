import { parseFeatureTitle } from "@/lib/text-utils";

interface FeatureTitleProps {
  title: string;
}

export function FeatureTitle({ title }: FeatureTitleProps) {
  const parsed = parseFeatureTitle(title);

  if (!parsed.hasNumber) {
    return (
      <h3 className="font-display font-semibold text-primary mb-3">
        {title}
      </h3>
    );
  }

  return (
    <h3 className="font-display font-semibold text-primary mb-3">
      {parsed.prefix && (
        <span className="text-lg">{parsed.prefix} </span>
      )}
      <span className="text-4xl md:text-5xl font-bold text-verde-primary">
        {parsed.number}
      </span>
      {parsed.suffix && (
        <span className="text-2xl font-bold text-verde-primary">
          {parsed.suffix}
        </span>
      )}
      {parsed.text && (
        <span className="text-lg"> {parsed.text}</span>
      )}
    </h3>
  );
}
