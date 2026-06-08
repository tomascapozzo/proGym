import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Color palettes ───────────────────────────────────────────────────────────

export interface ThemeColors {
  bg: string;
  card: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  textDisabled: string;
  accent: string;
  accentText: string; // text color to use ON accent-colored backgrounds
  accentBg: string;
  accentBgAlt: string;
  inputBg: string;
  tabBg: string;
  tabBorder: string;
  error: string;
  blue: string;
  setRowBg: string; // background for individual set rows in session
  // Fixed identity colors for routine types — same in both themes
  routineColors: {
    daily: string;
    weekly: string;
    monthly: string;
    skipped: string; // amber — used for skipped-day states across all routine types
    done: string;    // green — used for completed-day states
  };
  // Per-circuit accent colors — cycle through these when multiple circuits appear
  circuitPalette: Array<{ bg: string; text: string }>;
}

// Routine type colors are fixed identity colors — intentionally the same in both themes
const ROUTINE_COLORS: ThemeColors["routineColors"] = {
  daily: "#0EA5E9",
  weekly: "#6EE7B7",
  monthly: "#A78BFA",
  skipped: "#F59E0B",
  done: "#4ADE80",
};

const dark: ThemeColors = {
  bg: "#0D0D0D",
  card: "#141414",
  surface: "#1C1C1C",
  border: "#242424",
  text: "#FFFFFF",
  textMuted: "#888888",
  textDisabled: "#555555",
  accent: "#D4A853",
  accentText: "#0D0D0D",
  accentBg: "#2A1F0A",
  accentBgAlt: "#1A1206",
  inputBg: "#111111",
  tabBg: "#0D0D0D",
  tabBorder: "#1C1C1C",
  error: "#EF4444",
  blue: "#4A90D9",
  setRowBg: "#0D0D0D",
  routineColors: ROUTINE_COLORS,
  circuitPalette: [
    { bg: "#2A1F0A", text: "#D4A853" }, // gold
    { bg: "#1E3A5F", text: "#60A5FA" }, // blue
    { bg: "#2E1065", text: "#C084FC" }, // purple
    { bg: "#451A03", text: "#FBBF24" }, // amber
  ],
};

const light: ThemeColors = {
  bg: "#FEFDFB",
  card: "#FFFFFF",
  surface: "#F8F3EA",
  border: "#E5D9C0",
  text: "#1A1208",
  textMuted: "#7A6848",
  textDisabled: "#C0AF8A",
  accent: "#D4A853",
  accentText: "#1A1208",
  accentBg: "#FDF4E3",
  accentBgAlt: "#FEF9F0",
  inputBg: "#F5F0E7",
  tabBg: "#FFFFFF",
  tabBorder: "#E5D9C0",
  error: "#EF4444",
  blue: "#2563EB",
  setRowBg: "#F5F0E7",
  routineColors: ROUTINE_COLORS,
  circuitPalette: [
    { bg: "#FDF4E3", text: "#C9962A" }, // gold
    { bg: "#DBEAFE", text: "#2563EB" }, // blue
    { bg: "#EDE9FE", text: "#7C3AED" }, // purple
    { bg: "#FEF3C7", text: "#D97706" }, // amber
  ],
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  colors: dark,
  toggleTheme: () => {},
});

const STORAGE_KEY = "@proGym_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val !== null) setIsDark(val === "dark");
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{ isDark, colors: isDark ? dark : light, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
