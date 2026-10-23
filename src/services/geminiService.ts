import { ParsedVoiceCommand, FoodCategory, FoodItem, StorageLocation, UnitType } from '../types';
import { getRelativeDate } from '../data/mockData';

const API_URL = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8001';

interface GeminiResponse {
  action: 'add' | 'remove' | 'move' | 'unknown';
  food_name: string;
  quantity: number | null;
  unit: string;
  location: 'Refrigerator' | 'Freezer' | 'Pantry' | 'unknown';
  destination_location: 'Refrigerator' | 'Freezer' | 'Pantry' | 'unknown';
  clarification_needed: boolean;
  clarification_question: string;
  category: string;
  shelf_life_recommendation_days: number | null;
  printed_expiry_date: string | null;
  date_added: string | null;
  confidence: number;
  safety_advisory: string;
}

const locationMap: Record<GeminiResponse['location'], StorageLocation> = {
  Refrigerator: 'Refrigerator',
  Freezer: 'Freezer',
  Pantry: 'Pantry/Crisper',
  unknown: 'Refrigerator',
};

const categoryMap: Record<string, FoodCategory> = {
  Produce: 'Produce',
  'Dairy & Eggs': 'Dairy & Eggs',
  'Meat & Seafood': 'Meat & Seafood',
  Leftovers: 'Leftovers',
  Beverages: 'Beverages',
  'Condiments & Sauces': 'Condiments & Sauces',
  Bakery: 'Bakery',
  Other: 'Other',
};

function toParsedCommand(rawTranscript: string, result: GeminiResponse): ParsedVoiceCommand {
  const foodName = result.food_name.trim();
  const shelfLife = result.shelf_life_recommendation_days;
  const itemData: Partial<FoodItem> = {
    name: foodName,
    category: categoryMap[result.category] || 'Other',
    quantity: result.quantity && result.quantity > 0 ? result.quantity : 1,
    unit: (result.unit || 'items') as UnitType,
    location: locationMap[result.location],
    estimatedShelfLifeDays: shelfLife || 7,
    estimatedExpiryDate: result.printed_expiry_date || getRelativeDate(shelfLife || 7),
    storageGuidance: result.safety_advisory || 'Store according to the package instructions.',
    status: 'Fresh',
    notes: result.printed_expiry_date
      ? `Expiry detected from packaging: ${result.printed_expiry_date}`
      : 'Shelf life estimated by Gemini.',
  };

  return {
    rawTranscript,
    intent: result.action === 'add' ? 'add_food' : result.action === 'remove' ? 'remove_food' : result.action === 'move' ? 'move_food' : 'unknown',
    confidence: result.confidence,
    foodName,
    quantity: itemData.quantity,
    unit: itemData.unit,
    location: itemData.location,
    category: itemData.category,
    clarificationPrompt: result.clarification_needed ? result.clarification_question : undefined,
    previewSummary: result.safety_advisory || `Gemini identified ${foodName || 'an item'}.`,
    actionPayload: result.action === 'add' && foodName ? { action: 'add', itemData } : undefined,
  };
}

export async function parseWithGemini(transcript: string): Promise<ParsedVoiceCommand> {
  const response = await fetch(`${API_URL}/api/v1/ai/voice-parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!response.ok) throw new Error((await response.json()).detail || 'Gemini request failed.');
  return toParsedCommand(transcript, await response.json() as GeminiResponse);
}

export async function detectFoodImage(file: File, transcript = ''): Promise<ParsedVoiceCommand> {
  const form = new FormData();
  form.append('image', file);
  form.append('transcript', transcript);
  const response = await fetch(`${API_URL}/api/v1/ai/image-detect`, { method: 'POST', body: form });
  if (!response.ok) throw new Error((await response.json()).detail || 'Gemini image request failed.');
  return toParsedCommand(transcript || 'Image food detection', await response.json() as GeminiResponse);
}
