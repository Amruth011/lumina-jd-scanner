import { DecodeResult, ResumeGapResult } from "@/types/jd";

const STORAGE_KEY = "lumina_session_v1";

export interface SessionData {
  currentJD: string | null;
  currentJDDecoded: DecodeResult | null;
  uploadedResume: string | null;
  currentGapAnalysis: ResumeGapResult | null;
  currentTailoredResume: string | null;
  atsScoreBefore: number | null;
  atsScoreAfter: number | null;
  sessionId: string;
}

export const initialSessionData: SessionData = {
  currentJD: null,
  currentJDDecoded: null,
  uploadedResume: null,
  currentGapAnalysis: null,
  currentTailoredResume: null,
  atsScoreBefore: null,
  atsScoreAfter: null,
  sessionId: Math.random().toString(36).substring(2, 15),
};

export const saveSession = (data: SessionData) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const loadSession = (): SessionData => {
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse session data", e);
      }
    }
  }
  return initialSessionData;
};

export const clearSession = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
};
