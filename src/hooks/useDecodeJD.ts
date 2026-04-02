import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DecodeResult } from "@/types/jd";

export const useDecodeJD = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<DecodeResult | null>(null);

  const resetResults = () => setResults(null);

  const decodeJD = async (jdText: string) => {
    if (jdText.trim().length < 20) {
      toast.error("Please paste a job description (min 20 characters).");
      return;
    }

    setIsScanning(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("decode-jd", {
        body: { jdText },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResults({
        title: data.title,
        skills: data.skills,
        requirements: data.requirements || { education: [], experience: "", soft_skills: [], agreements: [] },
        winning_strategy: data.winning_strategy || [],
      });
      toast.success(`Decoded: ${data.title}`, { duration: 4000 });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to decode JD. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    results,
    setResults,
    resetResults,
    decodeJD
  };
};
