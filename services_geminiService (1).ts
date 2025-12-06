import { GoogleGenAI, Type } from "@google/genai";
import { Friend, Coordinates } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a safety status report or location insight for a friend.
 */
export const getFriendInsight = async (friend: Friend, userLocation: Coordinates): Promise<{ text: string; urls: string[] }> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // We can use Google Maps tool to check nearby places if we want detailed context
    // Prompting for general safety/status insight
    const prompt = `
      You are a helpful safety assistant for a family location tracking app.
      The user is asking about their friend/family member: "${friend.name}".
      
      Here is the data:
      - Friend Name: ${friend.name}
      - Friend Location: Lat ${friend.location.lat}, Lng ${friend.location.lng}
      - Friend Status: ${friend.status}
      - Battery: ${friend.batteryLevel}%
      - Current User Location: Lat ${userLocation.lat}, Lng ${userLocation.lng}
      - Time: ${new Date().toLocaleTimeString()}

      Please provide a brief, reassuring, and intelligent status summary. 
      Mention how far away they are (approximate calculation is fine) and suggest what they might be doing based on the coordinates if possible (e.g. if near a park, say enjoying the park). 
      If battery is low, warn the user.
      Keep it under 3 sentences.
    `;

    // Use grounding to find real places at the friend's location
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
            retrievalConfig: {
                latLng: {
                    latitude: friend.location.lat,
                    longitude: friend.location.lng
                }
            }
        }
      }
    });

    const text = response.text || "Currently unable to generate insight.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const urls: string[] = [];
    if (chunks) {
        chunks.forEach(chunk => {
            if (chunk.maps?.uri) urls.push(chunk.maps.uri);
            if (chunk.web?.uri) urls.push(chunk.web.uri);
        });
    }

    return { text, urls };
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return { text: "Unable to connect to safety assistant.", urls: [] };
  }
};

/**
 * Finds nearby places of interest for a friend (e.g., "Where can Mom get coffee?").
 */
export const findNearbyPlaces = async (query: string, location: Coordinates): Promise<{ text: string; urls: string[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find places matching "${query}" near this location. List 3 top options with brief descriptions.`,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.lat,
                            longitude: location.lng
                        }
                    }
                }
            }
        });

        const text = response.text || "No recommendations found.";
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        const urls: string[] = [];
        if (chunks) {
            chunks.forEach(chunk => {
                if (chunk.maps?.uri) urls.push(chunk.maps.uri);
            });
        }
        
        return { text, urls };
    } catch (error) {
        console.error("Gemini Places Error:", error);
        return { text: "Could not search for places.", urls: [] };
    }
}
