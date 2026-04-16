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
  bg: "#0A0F1A",
  card: "#111827",
  surface: "#1C2535",
  border: "#1E293B",
  text: "#FFFFFF",
  textMuted: "#888888",
  textDisabled: "#555555",
  accent: "#6EE7B7",
  accentText: "#0A0F1A",
  accentBg: "#064E3B",
  accentBgAlt: "#0D2A1F",
  inputBg: "#0F172A",
  tabBg: "#0D1420",
  tabBorder: "#1C2535",
  error: "#EF4444",
  blue: "#2563EB",
  setRowBg: "#0D1117",
  routineColors: ROUTINE_COLORS,
};

const light: ThemeColors = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  surface: "#EDF2F7",
  border: "#CBD5E1",
  text: "#0F172A",
  textMuted: "#64748B",
  textDisabled: "#94A3B8",
  accent: "#059669",
  accentText: "#FFFFFF",
  accentBg: "#D1FAE5",
  accentBgAlt: "#ECFDF5",
  inputBg: "#F1F5F9",
  tabBg: "#FFFFFF",
  tabBorder: "#E2E8F0",
  error: "#EF4444",
  blue: "#2563EB",
  setRowBg: "#F1F5F9",
  routineColors: ROUTINE_COLORS,
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
