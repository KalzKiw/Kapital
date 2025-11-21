import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData, Category } from "../types";

// Helper safely get API Key
const getApiKey = (): string => {
  try {
    // Check if process exists (Node/Bundled env)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Fallback or empty if not found
    return '';
  } catch (e) {
    console.warn("Environment variable access failed", e);
    return '';
  }
};

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeReceipt = async (file: File): Promise<ReceiptData> => {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      console.error("API Key is missing");
      throw new Error("API Key no configurada. Verifica tu entorno.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
      Analiza esta imagen de un recibo o factura.
      Extrae la siguiente información:
      1. Cantidad total (número).
      2. Fecha (formato ISO string).
      3. Nombre del comerciante o descripción breve.
      4. Categoría más apropiada de esta lista: [Alimentación, Transporte, Vivienda, Entretenimiento, Compras, Salud, Otros].
      
      Si no encuentras algún dato, déjalo como null.
      Devuelve SOLO JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            merchant: { type: Type.STRING },
            category: { type: Type.STRING, enum: Object.values(Category) }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return {};

    const data = JSON.parse(text);
    
    return {
        amount: data.amount,
        date: data.date,
        merchant: data.merchant,
        category: data.category as Category
    };

  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw error;
  }
};