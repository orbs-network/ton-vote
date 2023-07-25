import { createTheme, Theme } from "@mui/material";
import { useAppSettings } from "hooks/hooks";
import { useEffect } from "react";


export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F8F9FB",
      paper: "white",
    },
    error: {
      main: "#d32f2f",
    },
    primary: {
      main: "#0098ea",
    },
    text: {
      primary: "rgb(114, 138, 150)",
      secondary: "rgb(22, 28, 40)",
    },
  },

  typography: {
    allVariants: {
      color: "rgb(114, 138, 150)",
      fontFamily: "mulish",
    },
    h1: {
      fontSize: 44,
      fontWeight: 800,
      color: "rgb(22, 28, 40)",
    },
    h2: {
      fontSize: 20,
      fontWeight: 800,
      color: "rgb(22, 28, 40)",
    },
    h4: {
      fontSize: 20,
      fontWeight: 800,
      color: "rgb(22, 28, 40)",
    },
    fontFamily: "mulish",
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#222830",
      paper: "#222830",
    },
    error: {
      main: "#d32f2f",
    },
    primary: {
      main: "#0098ea",
    },
    secondary: {
      main: "#2B303B",
    },
    text: {
      primary: "rgba(255,255,255,0.8)",
      secondary: "rgba(255,255,255,0.8)",
    },
  },

  typography: {
    allVariants: {
      color: "rgba(255,255,255,0.8)",
      fontFamily: "mulish",
    },
    h1: {
      fontSize: 44,
      fontWeight: 800,
      color: "rgba(255,255,255,0.8)",
    },
    h2: {
      fontSize: 20,
      fontWeight: 800,
      color: "rgba(255,255,255,0.8)",
    },
    h4: {
      fontSize: 20,
      fontWeight: 800,
      color: "rgba(255,255,255,0.8)",
    },
    fontFamily: "mulish",
  },
});

const darkThemeBorder = "rgba(255,255,255, 0.2)";
const lightModeBorder = "#e0e0e0";

export const getBorderColor = (mode: "light" | "dark") => {
  return mode === "light" ? lightModeBorder : darkThemeBorder;
};

export const useInitThemeMode = () => {
  const { themeMode, setThemeMode } = useAppSettings();

  useEffect(() => {
    if (themeMode) return;
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setThemeMode(isDark ? "dark" : "light");
  }, []);
};
