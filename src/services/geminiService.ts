import { GoogleGenAI } from "@google/genai";
import { FALLBACK_QUIZZES, getFallbackAnswer } from "./fallbackData";

// Lazy-loaded client-side fallback (specifically for static serverless environments like Vercel)
let clientAiInstance: any = null;
function getClientAiInstance() {
  if (!clientAiInstance) {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("Client Gemini API key missing, will use fallback data.");
    }
    clientAiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return clientAiInstance;
}

export async function getStudyAnswer(prompt: string, imageBase64?: string, studentContext?: { name: string; school: string; className: string }) {
  // 1. Try secure backend server route (Primary route)
  try {
    const response = await fetch("/api/gemini/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, imageBase64, studentContext }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.text;
    }
    console.warn("Backend Gemini answer API failed, executing client-side fallback...");
  } catch (error) {
    console.warn("Backend Gemini answer API unreachable, executing client-side fallback...", error);
  }

  // 2. Client-side fallback
  try {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("Client Gemini API key missing");
    }
    const ai = getClientAiInstance();
    const parts: any[] = [{ text: prompt }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }

    const systemInstruction = studentContext 
      ? `You are an encouraging, friendly study helper for a child named ${studentContext.name} who studies in ${studentContext.className} at ${studentContext.school}. Explain concepts clearly using step-by-step solutions suitable for class/grade ${studentContext.className}. Support subjects like Math, Science, Biology, Physics, Chemistry, and English. Keep your tone highly personalized, warm, and highly encouraging, referring to their school or name when it fits naturally.`
      : "You are a helpful study assistant. Explain concepts clearly and provide step-by-step solutions. Support subjects like Math, Science, Biology, Physics, Chemistry, and English. If the user asks for a diagram or visual explanation, describe it clearly or suggest a visual aid.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
      },
    });
    
    return response.text;
  } catch (clientError) {
    console.warn("Client Gemini answer generation failed. Returning smart fallback answer.", clientError);
    return getFallbackAnswer(prompt, studentContext);
  }
}

export async function generateStudyDiagram(prompt: string) {
  // 1. Try secure backend server route (Primary route)
  try {
    const response = await fetch("/api/gemini/diagram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.imageUrl;
    }
    console.warn("Backend Gemini diagram API failed, executing client-side fallback...");
  } catch (error) {
    console.warn("Backend Gemini diagram API unreachable, executing client-side fallback...", error);
  }

  // 2. Client-side fallback
  try {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("Client Gemini API key missing");
    }
    const ai = getClientAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ text: `Educational diagram or illustration for: ${prompt}. Clear, academic style, labeled if necessary.` }],
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (err) {
    console.warn("Client Gemini diagram generation failed.", err);
  }
  return null;
}

export async function generateQuiz(subject: string, studentContext?: { name: string; school: string; className: string }, language: string = "English") {
  // 1. Try secure backend server route (Primary route)
  try {
    const response = await fetch("/api/gemini/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, studentContext, language }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
    console.warn("Backend Gemini quiz API failed or returned empty, executing client-side fallback...");
  } catch (error) {
    console.warn("Backend Gemini quiz API unreachable, executing client-side fallback...", error);
  }

  // 2. Client-side fallback
  try {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("Client Gemini API key missing");
    }
    const ai = getClientAiInstance();
    const classText = studentContext ? `for grade/class ${studentContext.className}` : "";
    const instructionText = language === "Hindi"
      ? `Generate a 5-question multiple choice quiz ${classText} for ${subject} entirely in Hindi language (using clear Devanagari script suitable for classroom study). All questions, descriptions, and option texts MUST be in clean Hindi. Return only valid JSON in the format: [{"question": "...", "options": ["...", "...", "...", "..."], "answer": 0}]`
      : `Generate a 5-question multiple choice quiz ${classText} for ${subject} in English. Return only valid JSON in the format: [{"question": "...", "options": ["...", "...", "...", "..."], "answer": 0}]`;

    const model = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: instructionText,
      config: {
        responseMimeType: "application/json",
      },
    });
    const response = await model;
    try {
      const parsed = JSON.parse(response.text || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn("Client quiz JSON parsing failed, using hardcoded fallback.", e);
    }
  } catch (clientError) {
    console.warn("Client Gemini quiz generation failed. Serving high-quality fallback quiz database.", clientError);
  }

  // Final guaranteed fallback
  const langKey = (language === "Hindi" ? "Hindi" : "English") as "Hindi" | "English";
  return FALLBACK_QUIZZES[subject]?.[langKey] || FALLBACK_QUIZZES[subject]?.["English"] || [];
}
