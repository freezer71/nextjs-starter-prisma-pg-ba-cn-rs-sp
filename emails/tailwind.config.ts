import { pixelBasedPreset, type TailwindConfig } from "react-email";

/**
 * Configuration Tailwind des emails (les clients mail ne supportent pas `rem`).
 * Les couleurs de marque sont en hexadécimal : oklch n'est pas supporté dans les emails.
 */
export const emailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        brand: "#171717",
        "brand-foreground": "#fafafa",
        muted: "#737373",
        border: "#e5e5e5",
        surface: "#ffffff",
        canvas: "#f5f5f5",
      },
    },
  },
} satisfies TailwindConfig;
