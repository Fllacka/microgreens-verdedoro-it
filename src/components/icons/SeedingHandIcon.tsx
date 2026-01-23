import React from "react";

interface SeedingHandIconProps {
  className?: string;
}

/**
 * Custom icon showing a hand sowing/scattering seeds downward
 * Designed to match Lucide icon style (24x24 viewBox, stroke-based)
 */
const SeedingHandIcon: React.FC<SeedingHandIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Hand palm facing down, fingers slightly curved */}
      <path d="M6 8c0-1.5 1-3 3-3h1c1.5 0 2.5.8 3 2" />
      <path d="M13 7c.5-1.2 1.5-2 3-2h.5c1.5 0 2.5 1 2.5 2.5v1" />
      <path d="M19 8.5v2c0 1.5-1 2.5-2.5 2.5H8c-2 0-3-1.5-3-3V8" />
      
      {/* Wrist/arm */}
      <path d="M5 10v-1c0-1 .5-2 1.5-2" />
      
      {/* Seeds falling - 4 seeds at different positions */}
      <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="21" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="22" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
};

export default SeedingHandIcon;
