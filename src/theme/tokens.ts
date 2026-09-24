export const colors = {
  background: "#0F111A",
  surface: "#1E2235",
  surfaceMuted: "#141725",
  ink: "#FFFFFF",
  inkMuted: "#8F9BB3",
  border: "#282E47",
  accent: "#D2FF24",
  accentSoft: "rgba(210, 255, 36, 0.1)",
  accentLilac: "#7C3AED",
  accentMint: "#10B981",
  accentButter: "#F59E0B",
  accentInk: "#0F111A",
  overlay: "rgba(15, 17, 26, 0.75)",
  danger: "#EF4444",
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const shadows = {
  soft: {
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
} as const;
