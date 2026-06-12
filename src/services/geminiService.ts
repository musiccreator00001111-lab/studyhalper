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

async function callGeminiWithRetryAndFailover(
  ai: any,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  retries = 3,
  delay = 1000
): Promise<any> {
  const isImageModel = params.model.indexOf("image") !== -1;
  const modelsToTry = isImageModel 
    ? [params.model] 
    : [params.model, "gemini-3.1-flash-lite"];

  for (const modelCandidate of modelsToTry) {
    let currentRetries = retries;
    let currentDelay = delay;
    while (currentRetries >= 0) {
      try {
        const result = await ai.models.generateContent({
          ...params,
          model: modelCandidate,
        });
        return result;
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        const isTransient = error.status === 503 || error.statusCode === 503 || error.code === 503 || 
                            errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("high demand") || errorMsg.includes("temporary");
        if (isTransient && currentRetries > 0) {
          console.warn(`Gemini client transient error on model ${modelCandidate} (${errorMsg}). Retrying in ${currentDelay}ms... (${currentRetries} retries left)`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentRetries--;
          currentDelay *= 2;
        } else {
          console.warn(`Gemini client call failed for model ${modelCandidate}. Error:`, errorMsg);
          break;
        }
      }
    }
  }
  throw new Error("All candidate Gemini models failed after retries.");
}

export async function getStudyAnswer(prompt: string, imageBase64?: string, studentContext?: { name: string; school: string; className: string }, language: string = "English") {
  // 1. Try secure backend server route (Primary route)
  try {
    const response = await fetch("/api/gemini/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, imageBase64, studentContext, language }),
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

    let langInstruction = `Explain everything in English.`;
    if (language === "Hindi") {
      langInstruction = `You MUST explain entirely in clean, formal Hindi using Devanagari script. All calculations, steps, text, and encouraging words must be in Devangari Hindi.`;
    } else if (language === "Hinglish") {
      langInstruction = `You MUST explain concepts in Hinglish (a friendly mix of simple Hindi and English, written in a warm, conversational tone using Latin or Devanagari characters, e.g., 'Hello! Heart humari body ka ek organ hai jo blood pump karta hai. Iske 4 parts hote hai...'). Speak like a helpful study teammate.`;
    } else if (language === "Marathi") {
      langInstruction = `You MUST explain entirely in clear, friendly Marathi language.`;
    } else if (language === "Tamil") {
      langInstruction = `You MUST explain entirely in clear, friendly Tamil language.`;
    } else if (language === "Bengali") {
      langInstruction = `You MUST explain entirely in clear, friendly Bengali language.`;
    } else if (language === "Spanish") {
      langInstruction = `You MUST explain entirely in clear, friendly Spanish language.`;
    } else if (language === "French") {
      langInstruction = `You MUST explain entirely in clear, friendly French language.`;
    } else if (language === "German") {
      langInstruction = `You MUST explain entirely in clear, friendly German language.`;
    }

    const systemInstruction = studentContext 
      ? `You are an encouraging, friendly study helper for a child named ${studentContext.name} who studies in ${studentContext.className} at ${studentContext.school}. Explain concepts clearly using step-by-step solutions suitable for class/grade ${studentContext.className}. Support subjects like Math, Science, Biology, Physics, Chemistry, and English. Keep your tone highly personalized, warm, and highly encouraging, referring to their school or name when it fits naturally. ${langInstruction}`
      : `You are a helpful study assistant. Explain concepts clearly and provide step-by-step solutions. Support subjects like Math, Science, Biology, Physics, Chemistry, and English. If the user asks for a diagram or visual explanation, describe it clearly or suggest a visual aid. ${langInstruction}`;

    const response = await callGeminiWithRetryAndFailover(ai, {
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
    const response = await callGeminiWithRetryAndFailover(ai, {
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
    let langPromptText = `in English`;
    if (language === "Hindi") {
      langPromptText = `entirely in Hindi language (using clear Devanagari script suitable for classroom study). All questions, descriptions, and option texts MUST be in clean Hindi.`;
    } else if (language === "Hinglish") {
      langPromptText = `in Hinglish language (a casual mix of English and Hindi words written using standard English/Latin alphabet, e.g., 'Soil erosion ko prevent karne ka best way kya hai?'). All questions, descriptions, and option texts MUST be in clean Hinglish sentence structures.`;
    } else if (language === "Marathi") {
      langPromptText = `entirely in Marathi language. All questions, descriptions, and option texts MUST be in clean Marathi.`;
    } else if (language === "Tamil") {
      langPromptText = `entirely in Tamil language. All questions, descriptions, and option texts MUST be in clean Tamil.`;
    } else if (language === "Bengali") {
      langPromptText = `entirely in Bengali language. All questions, descriptions, and option texts MUST be in clean Bengali.`;
    } else if (language === "Spanish") {
      langPromptText = `entirely in Spanish language. All questions, descriptions, and option texts MUST be in clean Spanish.`;
    } else if (language === "French") {
      langPromptText = `entirely in French language. All questions, descriptions, and option texts MUST be in clean French.`;
    } else if (language === "German") {
      langPromptText = `entirely in German language. All questions, descriptions, and option texts MUST be in clean German.`;
    }

    const instructionText = `Generate a 5-question multiple choice quiz ${classText} for ${subject} ${langPromptText}. Return only valid JSON in the format: [{"question": "...", "options": ["...", "...", "...", "..."], "answer": 0}]`;

    const response = await callGeminiWithRetryAndFailover(ai, {
      model: "gemini-3.5-flash",
      contents: instructionText,
      config: {
        responseMimeType: "application/json",
      },
    });
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
