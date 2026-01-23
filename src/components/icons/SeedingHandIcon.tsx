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
      {/* Hand silhouette - tilted, palm facing down-left */}
      <path d="M4 6.5C4 5.67 4.67 5 5.5 5h1C7.33 5 8 5.67 8 6.5V7h1V5.5C9 4.67 9.67 4 10.5 4h1c.83 0 1.5.67 1.5 1.5V7h1V5c0-.55.45-1 1-1h1c.83 0 1.5.67 1.5 1.5V7h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 2.5-1.5 4-4 4H11l-3 3c-.5.5-1.5.5-2 0l-1-1c-.5-.5-.5-1.5 0-2l2-2H5.5C4.67 12.5 4 11.83 4 11V6.5z" />
      
      {/* Curved line detail on palm */}
      <path 
        d="M9 8.5c1.5.5 3 1 4.5.5" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.5"
        opacity="0.3"
      />
      
      {/* Seeds dropping - teardrop/oval shapes */}
      <ellipse cx="13" cy="17" rx="1.2" ry="1.6" />
      <ellipse cx="16.5" cy="19" rx="1" ry="1.3" />
      <ellipse cx="10" cy="20" rx="0.9" ry="1.2" />
    </svg>
  );
};

export default SeedingHandIcon;
