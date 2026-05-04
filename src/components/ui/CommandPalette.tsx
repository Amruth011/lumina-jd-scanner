import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  LayoutDashboard, 
  Home, 
  PlusCircle, 
  Share2, 
  FileText, 
  Settings,
  HelpCircle,
  Zap
} from "lucide-react";
import { useKeyboardShortcut, useSequenceShortcut } from "@/lib/keyboard-shortcuts";
import { generateShareUrl, copyToClipboard } from "@/lib/shareUtils";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useKeyboardShortcut("k", () => setOpen((prev) => !prev));
  
  useSequenceShortcut(["g", "d"], () => navigate("/dashboard"));
  useSequenceShortcut(["g", "h"], () => navigate("/"));

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Go to Dashboard</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">G</span>D
            </kbd>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Go to Home</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">G</span>H
            </kbd>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Analysis</span>
            <Zap className="ml-auto h-3 w-3 text-yellow-500" />
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            const url = generateShareUrl({ title: "Lumina Intelligence Result" });
            copyToClipboard(url);
          })}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share Results</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            // Trigger custom event for resume export if on appropriate page
            window.dispatchEvent(new Event('trigger-resume-export'));
          })}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Export Resume</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="System">
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/help"))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Support</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
