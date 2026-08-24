// StudyFlow theme tokens — Dark-First Utility (Personality 7).
// Warm rust accent, sharp/solid surfaces, no glass/blur.

export const colors = {
  surface: "#0F1115",
  onSurface: "#F3F4F6",
  surfaceSecondary: "#1A1D24",
  onSurfaceSecondary: "#D1D5DB",
  surfaceTertiary: "#252932",
  onSurfaceTertiary: "#9CA3AF",
  surfaceInverse: "#F3F4F6",
  onSurfaceInverse: "#0F1115",

  brand: "#D97736",
  brandPrimary: "#D97736",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#B55D25",
  brandTertiary: "rgba(217, 119, 54, 0.12)",
  onBrandTertiary: "#E08B53",

  success: "#10B981",
  onSuccess: "#FFFFFF",
  warning: "#F59E0B",
  error: "#F43F5E",
  onError: "#FFFFFF",

  border: "#2E333D",
  borderStrong: "#4B5563",
  divider: "#2E333D",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
  "5xl": 64,
} as const;

export const fonts = {
  display: {
    medium: "BarlowCondensed-Medium",
    semibold: "BarlowCondensed-SemiBold",
    bold: "BarlowCondensed-Bold",
  },
  text: {
    regular: "Manrope-Regular",
    medium: "Manrope-Medium",
    semibold: "Manrope-SemiBold",
    bold: "Manrope-Bold",
    extrabold: "Manrope-ExtraBold",
  },
} as const;

export const appFontMap = {
  "BarlowCondensed-Medium": require("../../assets/fonts/BarlowCondensed-Medium.ttf"),
  "BarlowCondensed-SemiBold": require("../../assets/fonts/BarlowCondensed-SemiBold.ttf"),
  "BarlowCondensed-Bold": require("../../assets/fonts/BarlowCondensed-Bold.ttf"),
  "Manrope-Regular": require("../../assets/fonts/Manrope-Regular.ttf"),
  "Manrope-Medium": require("../../assets/fonts/Manrope-Medium.ttf"),
  "Manrope-SemiBold": require("../../assets/fonts/Manrope-SemiBold.ttf"),
  "Manrope-Bold": require("../../assets/fonts/Manrope-Bold.ttf"),
  "Manrope-ExtraBold": require("../../assets/fonts/Manrope-ExtraBold.ttf"),
};

export const images = {
  homeHeaderBg:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxkYXJrJTIwbWluaW1hbCUyMGdyYXBoaXRlJTIwdGV4dHVyZSUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzg3NTc2NTIzfDA&ixlib=rb-4.1.0&q=85",
  tasksEmpty:
    "https://images.pexels.com/photos/13722865/pexels-photo-13722865.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};
