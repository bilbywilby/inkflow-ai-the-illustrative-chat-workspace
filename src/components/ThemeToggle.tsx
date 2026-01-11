import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "absolute top-4 right-4" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className={`${className} hover:scale-110 hover:rotate-12 transition-all duration-200 active:scale-90 z-50`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
