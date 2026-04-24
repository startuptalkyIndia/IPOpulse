"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("ipopulse-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const t: "light" | "dark" = stored === "dark" ? "dark" : stored === "light" ? "light" : prefersDark ? "dark" : "light";
    apply(t);
  }, []);

  function apply(t: "light" | "dark") {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem("ipopulse-theme", t);
  }

  return (
    <button
      onClick={() => apply(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
