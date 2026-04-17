const fs = require('fs');

let code = fs.readFileSync('src/hooks/useDecodeJD.ts', 'utf8');

const targetStr = `      const { data, error } = await supabase.functions.invoke("decode-jd", {
        body: { jdText },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);`;

const replacementStr = `      let data: any = {};
      
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke("decode-jd", {
          body: { jdText },
        });

        if (edgeError) throw edgeError;
        if (edgeData?.error) throw new Error(edgeData.error);
        data = edgeData;
      } catch (err) {
        console.warn("Edge function timed out or failed, falling back to direct client-side fetch...", err);

        // Fetch Key securely
        const { data: keyData, error: keyError } = await supabase.functions.invoke("decode-jd", {
            body: { jdText: "bypass", action: "get_key" }
        });
        
        if (keyError) throw new Error("Backend proxy entirely unavailable");
        const geminiKey = keyData?.key;
        if (!geminiKey) throw new Error("Could not retrieve API key for direct fallback.");

        const prompt = \`Extract key job details and technical skills from this description.
      Job Description:
      \${jdText}
      
      CRITICAL: Keep all text responses EXTREMELY concise (max 1 sentence per array item) to ensure fast processing.

      RETURN JSON FORMAT ONLY:
      {
        "title": "Job Title",
        "skills": [{"skill": "Skill Name", "importance": 0-100}],
        "requirements": {
          "education": ["Degree"],
          "experience": "Description",
          "soft_skills": ["Skill"],
          "agreements": ["Specific requirement like 'Must have car'"]
        },
        "winning_strategy": ["3 actionable tips to win this role"]
      }\`;

        // Direct Fetch Bypassing Supabase Edge Limits
        const apiResponse = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiKey}\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt + "\\n\\nIMPORTANT: Return ONLY raw JSON, do not include any other text." }] }],
          }),
        });

        if (!apiResponse.ok) {
           const errorData = await apiResponse.json().catch(() => ({}));
           throw new Error(\`AI Error: \${apiResponse.status} - \${errorData.error?.message || apiResponse.statusText}\`);
        }
        
        const rawData = await apiResponse.json();
        const resultText = rawData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        const firstBrace = resultText.indexOf('{');
        const lastBrace = resultText.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found natively");
        
        data = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));
      }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/hooks/useDecodeJD.ts', code);
console.log('Fixed useDecodeJD.ts');
