import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { Shield } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, isHighContrast, setIsHighContrast } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="glass bg-transparent border-white/10 hover:bg-white/5 transition-colors">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-strong border-white/10 text-foreground min-w-[150px]">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer hover:bg-white/5 flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Executive Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer hover:bg-white/5 flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Deep Obsidian
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer hover:bg-white/5 flex items-center gap-2">
          <Laptop className="h-4 w-4" />
          System Match
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="opacity-20" />
        
        <DropdownMenuItem 
          onClick={(e) => {
            e.preventDefault();
            setIsHighContrast(!isHighContrast);
          }} 
          className="cursor-pointer hover:bg-white/5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold">Executive Contrast</span>
          </div>
          <div className={`w-8 h-4 rounded-full transition-colors relative border ${isHighContrast ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-400 border-zinc-500'}`}>
            <div className={`absolute w-2.5 h-2.5 shadow-sm rounded-full top-0.5 transition-transform ${isHighContrast ? 'translate-x-[18px] bg-white' : 'translate-x-0.5 bg-white'}`} />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
