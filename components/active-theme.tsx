"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME } from "@/lib/themes";
import { useAuth } from "@/contexts/AuthContext";

// Tipos
export type Preset = "default" | "sunset-glow";
export type Radius = "default" | "md" | "lg";
export type Scale = "none" | "sm" | "md" | "lg";
export type Layout = "full" | "compact";

export type ThemeType = {
  preset: Preset;
  radius: Radius;
  scale: Scale;
  contentLayout: Layout;
};

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Utilidade para salvar cookie
function setThemeCookie(key: string, value: string | null) {
  if (typeof window === "undefined") return;

  const secure = window.location.protocol === "https:" ? "Secure;" : "";

  if (!value) {
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax; ${secure}`;
  } else {
    document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax; ${secure}`;
  }
}

// Provider
export function ActiveThemeProvider({
  children,
  initialTheme,
  promotoraId,
}: {
  children: ReactNode;
  initialTheme?: ThemeType;
  promotoraId?: string;
}) {
  const [theme, setTheme] = useState<ThemeType>(initialTheme || DEFAULT_THEME);
  const { selectedPromotoraTemas, selectedPromotoraLogo } = useAuth();

  // console.log(selectedPromotoraLogo)

  // Aplica tema com base no tema da promotora
  useEffect(() => {
    if (selectedPromotoraTemas) {
      const themeFromPromotora: ThemeType = {
        preset: (selectedPromotoraTemas || "default") as Preset,
        radius: "default",
        scale: "md",
        contentLayout: "compact",
      };
      setTheme(themeFromPromotora);
    }
  }, [selectedPromotoraTemas]);

  // Define atributos e cookies com base no tema
  useEffect(() => {
    const body = document.body;

    const updateAttr = (key: string, value: string | null) => {
      setThemeCookie(key, value);
      const attrKey = `data-${key.replace("theme_", "theme-")}`;
      if (value) {
        body.setAttribute(attrKey, value);
      } else {
        body.removeAttribute(attrKey);
      }
    };

    updateAttr("theme_radius", theme.radius !== "default" ? theme.radius : null);
    updateAttr("theme_preset", theme.preset !== "default" ? theme.preset : null);
    updateAttr("theme_content_layout", theme.contentLayout);
    updateAttr("theme_scale", theme.scale !== "none" ? theme.scale : null);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para uso do tema
export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeConfig must be used within an ActiveThemeProvider");
  }
  return context;
}
