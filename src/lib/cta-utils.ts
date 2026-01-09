/**
 * Utility functions for CTA button visibility logic
 */

/**
 * Determines if a CTA button should be visible based on its visibility toggle
 * and whether it has valid text and link content.
 * 
 * @param isVisible - The explicit visibility toggle value (true/false/undefined)
 * @param text - The button text
 * @param link - The button link/URL
 * @returns true if the button should be displayed
 */
export const isCtaButtonVisible = (
  isVisible: boolean | undefined,
  text: string | undefined,
  link: string | undefined
): boolean => {
  // Button is visible only if toggle is ON (or undefined/true) AND both text and link exist
  return isVisible !== false && !!text?.trim() && !!link?.trim();
};
