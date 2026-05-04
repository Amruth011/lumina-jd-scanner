import React, { createContext, useContext, useState, useEffect } from "react";
import { SessionData, loadSession, saveSession, initialSessionData, clearSession as clearStorage } from "@/lib/sessionStorage";

interface SessionContextType extends SessionData {
  updateSession: (data: Partial<SessionData>) => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionData>(initialSessionData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const data = loadSession();
    setSession(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveSession(session);
    }
  }, [session, isLoaded]);

  const updateSession = (data: Partial<SessionData>) => {
    setSession((prev) => ({ ...prev, ...data }));
  };

  const resetSession = () => {
    clearStorage();
    setSession({ ...initialSessionData, sessionId: Math.random().toString(36).substring(2, 15) });
  };

  return (
    <SessionContext.Provider value={{ ...session, updateSession, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
