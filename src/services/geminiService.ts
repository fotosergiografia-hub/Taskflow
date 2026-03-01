import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const extractTasksFromText = async (text: string): Promise<Partial<Task>[]> => {
  if (!text.trim()) return [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following text extracted from a PDF and identify all activities, steps, or tasks. 
    For each one, extract a short title, a description, a due date if mentioned, and any mentioned assignee.
    
    Text:
    ${text}
    
    Return the result in JSON format with a list of tasks.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short title of the task" },
                description: { type: Type.STRING, description: "Detailed description of the task" },
                dueDate: { type: Type.STRING, description: "Due date in ISO format if possible, or empty string" },
                assignee: { type: Type.STRING, description: "Person responsible for the task" },
                priority: { 
                  type: Type.STRING, 
                  description: "Priority: low, medium, or high",
                  enum: ["low", "medium", "high"]
                }
              },
              required: ["title", "description", "priority"]
            }
          }
        },
        required: ["tasks"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || '{"tasks": []}');
    return result.tasks;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return [];
  }
};
