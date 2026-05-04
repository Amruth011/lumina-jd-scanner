import { useEffect } from "react";

type ShortcutHandler = (event: KeyboardEvent) => void;

export const useKeyboardShortcut = (key: string, handler: ShortcutHandler, metaKey = true) => {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const isMeta = metaKey ? (event.metaKey || event.ctrlKey) : true;
      if (event.key.toLowerCase() === key.toLowerCase() && isMeta) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [key, handler, metaKey]);
};

export const useSequenceShortcut = (sequence: string[], handler: () => void) => {
  useEffect(() => {
    let pressedKeys: string[] = [];
    let timeout: NodeJS.Timeout;

    const listener = (event: KeyboardEvent) => {
      pressedKeys.push(event.key.toLowerCase());
      clearTimeout(timeout);

      if (pressedKeys.length > sequence.length) {
        pressedKeys.shift();
      }

      if (pressedKeys.join("") === sequence.join("")) {
        handler();
        pressedKeys = [];
      }

      timeout = setTimeout(() => {
        pressedKeys = [];
      }, 1000);
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [sequence, handler]);
};
