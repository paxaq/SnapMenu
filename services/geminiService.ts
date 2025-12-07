import { GoogleGenAI, Type } from "@google/genai";
import { UploadedImage, MenuData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractMenuFromImages = async (images: UploadedImage[]): Promise<MenuData> => {
  if (images.length === 0) {
    throw new Error("No images provided");
  }

  // Construct parts for the model
  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.base64,
    },
  }));

  const systemInstruction = `
    You are an expert menu digitizer. 
    Your goal is to extract restaurant menu information from photos with high accuracy.
    - Extract the restaurant name. If not found, use "Restaurant Menu".
    - Group items into logical categories (Appetizers, Mains, Drinks, etc.) as they appear.
    - Extract item names, descriptions, and prices.
    - If prices are just numbers, assume the currency symbol found elsewhere or just the number.
    - Identify tags like 'Spicy', 'Vegan', 'GF' if explicitly marked or strongly implied by icons.
    - Be resilient to glare, handwriting, or complex layouts.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        ...imageParts,
        { text: "Extract the menu data from these images into a structured JSON format." },
      ],
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          restaurantName: { type: Type.STRING },
          description: { type: Type.STRING },
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      price: { type: Type.STRING },
                      tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["name", "price"],
                  },
                },
              },
              required: ["name", "items"],
            },
          },
        },
        required: ["restaurantName", "categories"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to extract menu data: No response text.");
  }

  try {
    return JSON.parse(text) as MenuData;
  } catch (e) {
    console.error("JSON Parse Error", e);
    throw new Error("Failed to parse menu data from AI response.");
  }
};
