import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isHighContrast: boolean;
  setIsHighContrast: (isHighContrast: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  isHighContrast: false,
  setIsHighContrast: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  contrastStorageKey = "vite-ui-contrast",
  ...props
}: ThemeProviderProps & { contrastStorageKey?: string }) {
  // Theme is now permanently locked to light for a classic professional look
  const theme = "light";
  
  const [isHighContrast, setIsHighContrast] = useState<boolean>(
    () => localStorage.getItem(contrastStorageKey) === "true"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("light");
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isHighContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [isHighContrast]);

  const value = {
    theme: "light" as Theme,
    setTheme: () => {
      console.warn("Theme is locked to light mode.");
    },
    isHighContrast,
    setIsHighContrast: (contrast: boolean) => {
      localStorage.setItem(contrastStorageKey, contrast.toString());
      setIsHighContrast(contrast);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
