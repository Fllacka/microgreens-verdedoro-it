import React from "react";

interface SeedingHandIconProps {
  className?: string;
}

/**
 * Custom icon showing a hand sowing/dropping seeds
 * Filled style matching the reference - hand silhouette with seed drops
 */
const SeedingHandIcon: React.FC<SeedingHandIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
    >
      {/* Hand silhouette - palm open, fingers together pointing right */}
      <path d="M3 9.5C3 8.67 3.5 8 4.2 8h.6c.7 0 1.2.67 1.2 1.5v.5h.5V8.5c0-.83.5-1.5 1.2-1.5h.6c.7 0 1.2.67 1.2 1.5V10h.5V7.5c0-.83.5-1.5 1.2-1.5h.6c.7 0 1.2.67 1.2 1.5V10h.5V8c0-.55.4-1 .9-1h.6c.7 0 1.2.67 1.2 1.5V10h.5V8.5c0-.83.5-1.5 1.2-1.5.7 0 1.2.67 1.2 1.5v4c0 2-1.2 3.5-3.5 3.5H10L7.5 18c-.4.4-1 .4-1.4 0L5 17c-.4-.4-.4-1 0-1.4L7 14H4.2c-.7 0-1.2-.67-1.2-1.5V9.5z" />
      
      {/* Seeds dropping - teardrop shapes falling */}
      <ellipse cx="14" cy="18.5" rx="1.3" ry="1.7" />
      <ellipse cx="17.5" cy="20.5" rx="1.1" ry="1.4" />
      <ellipse cx="11" cy="21" rx="1" ry="1.3" />
    </svg>
  );
};

export default SeedingHandIcon;
