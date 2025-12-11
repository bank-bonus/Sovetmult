import { GoogleGenAI, Type } from "@google/genai";
import { LoadingScreenData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLoadingScreen = async (
  gameContext: string
): Promise<LoadingScreenData> => {
  
  const prompt = `
    You are an expert creative frontend developer.
    I have a web game with the following code context/description:
    "${gameContext.slice(0, 10000)}" 
    
    Task:
    1. Analyze the context to determine the game's theme (e.g., retro, sci-fi, horror, cozy, puzzle).
    2. Create a custom, visually appealing loading screen (HTML, CSS, JS) that matches this theme.
    
    Requirements:
    - HTML: Must be wrapped in a single container <div id="ai-loading-screen">.
    - CSS: Make it look professional. Use animations. Ensure it covers the full screen (fixed, z-index 9999).
    - JS: 
      - Must include a visual progress animation (fake or real).
      - Must expose a global function 'window.startLoadingExit()' that triggers a fade-out animation and then removes the element from DOM.
      - The animation loop should start automatically.
    
    Return a JSON object with:
    - themeDescription: A short string describing the detected theme.
    - html: The HTML string.
    - css: The CSS string (do not include <style> tags).
    - js: The JS string (do not include <script> tags).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          themeDescription: { type: Type.STRING },
          html: { type: Type.STRING },
          css: { type: Type.STRING },
          js: { type: Type.STRING },
        },
        required: ['html', 'css', 'js', 'themeDescription']
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    return JSON.parse(text) as LoadingScreenData;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to generate valid JSON for loading screen.");
  }
};
