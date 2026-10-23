import { ParsedVoiceCommand, FoodItem, StorageLocation, FoodCategory, UnitType } from '../types';
import { DEFAULT_STORAGE_GUIDELINES, getRelativeDate } from '../data/mockData';

const WORD_TO_NUMBER: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  dozen: 12,
  half: 0.5,
};

const COMMON_CATEGORIES: Record<string, FoodCategory> = {
  milk: 'Dairy & Eggs',
  cheese: 'Dairy & Eggs',
  yogurt: 'Dairy & Eggs',
  butter: 'Dairy & Eggs',
  egg: 'Dairy & Eggs',
  eggs: 'Dairy & Eggs',
  cream: 'Dairy & Eggs',

  chicken: 'Meat & Seafood',
  salmon: 'Meat & Seafood',
  fish: 'Meat & Seafood',
  beef: 'Meat & Seafood',
  pork: 'Meat & Seafood',
  meat: 'Meat & Seafood',
  shrimp: 'Meat & Seafood',
  tuna: 'Meat & Seafood',

  apple: 'Produce',
  apples: 'Produce',
  spinach: 'Produce',
  banana: 'Produce',
  bananas: 'Produce',
  strawberry: 'Produce',
  strawberries: 'Produce',
  tomato: 'Produce',
  tomatoes: 'Produce',
  lettuce: 'Produce',
  carrot: 'Produce',
  carrots: 'Produce',
  broccoli: 'Produce',
  cucumber: 'Produce',

  pasta: 'Leftovers',
  curry: 'Leftovers',
  soup: 'Leftovers',
  pizza: 'Leftovers',
  bolognese: 'Leftovers',
  leftover: 'Leftovers',
  leftovers: 'Leftovers',

  juice: 'Beverages',
  water: 'Beverages',
  soda: 'Beverages',
  smoothie: 'Beverages',
  coke: 'Beverages',
  beer: 'Beverages',

  bread: 'Bakery',
  bagel: 'Bakery',
  cake: 'Bakery',
  croissant: 'Bakery',

  sauce: 'Condiments & Sauces',
  ketchup: 'Condiments & Sauces',
  mayo: 'Condiments & Sauces',
  mustard: 'Condiments & Sauces',
};

export class DemoVoiceParser {
  /**
   * Parse natural speech or typed command into structured intent & action preview
   */
  public parse(transcript: string, currentInventory: FoodItem[]): ParsedVoiceCommand {
    const raw = transcript.trim();
    const text = raw.toLowerCase().replace(/[.,!?;:]/g, '');

    if (!text) {
      return {
        rawTranscript: raw,
        intent: 'unknown',
        confidence: 0,
        clarificationPrompt: 'I could not hear any speech. Please try speaking again or type your command.',
      };
    }

    // 1. Check for Query Expiring Intent
    if (
      text.includes('expiring') ||
      text.includes('expire') ||
      text.includes('going bad') ||
      text.includes('spoil') ||
      (text.includes('what') && text.includes('soon'))
    ) {
      const expiringItems = currentInventory.filter(
        (i) => i.status === 'Approaching Expiry' || i.status === 'Requires Attention' || i.status === 'Expired'
      );
      return {
        rawTranscript: raw,
        intent: 'query_expiring',
        confidence: 0.95,
        previewSummary: `Found ${expiringItems.length} item(s) approaching estimated expiry or requiring immediate attention.`,
        actionPayload: {
          action: 'query',
        },
      };
    }

    // 2. Check for General Inventory Query Intent
    if (
      (text.includes('what') && (text.includes('fridge') || text.includes('in the') || text.includes('have'))) ||
      text.includes('show inventory') ||
      text.includes('list food') ||
      text.includes('what do we have')
    ) {
      return {
        rawTranscript: raw,
        intent: 'query_inventory',
        confidence: 0.9,
        previewSummary: `Total ${currentInventory.length} items currently logged across Refrigerator, Freezer, and Pantry/Crisper.`,
        actionPayload: {
          action: 'query',
        },
      };
    }

    // 3. Check for Move Intent (e.g., "Move the chicken to the freezer", "Transfer milk to crisper")
    if (text.includes('move') || text.includes('transfer') || text.includes('shift') || text.includes('put') && text.includes('into the freezer')) {
      const targetLocation = this.extractLocation(text, 'Freezer'); // default target if moving
      const matchedItem = this.findMatchingItem(text, currentInventory);

      if (!matchedItem) {
        // Try extracting food name
        const words = text.split(' ');
        const moveIdx = words.findIndex((w) => ['move', 'transfer', 'shift', 'put'].includes(w));
        const toIdx = words.indexOf('to');
        const candidateName = toIdx > moveIdx ? words.slice(moveIdx + 1, toIdx).filter((w) => !['the', 'my', 'some'].includes(w)).join(' ') : 'item';

        return {
          rawTranscript: raw,
          intent: 'move_food',
          confidence: 0.7,
          targetLocation,
          clarificationPrompt: `I understood you want to move food to the ${targetLocation}, but couldn't locate "${candidateName}" in your current inventory. Please check the item name.`,
        };
      }

      return {
        rawTranscript: raw,
        intent: 'move_food',
        confidence: 0.92,
        foodName: matchedItem.name,
        location: matchedItem.location,
        targetLocation,
        previewSummary: `Relocate "${matchedItem.name}" from ${matchedItem.location} to ${targetLocation}.`,
        actionPayload: {
          action: 'move',
          existingItemId: matchedItem.id,
          targetLocation,
        },
      };
    }

    // 4. Check for Remove Intent (e.g. "Remove the apples from the fridge", "Take out milk", "Ate the pasta")
    if (
      text.includes('remove') ||
      text.includes('take out') ||
      text.includes('delete') ||
      text.includes('ate ') ||
      text.includes('eaten') ||
      text.includes('threw away') ||
      text.includes('discard')
    ) {
      const matchedItem = this.findMatchingItem(text, currentInventory);

      if (!matchedItem) {
        return {
          rawTranscript: raw,
          intent: 'remove_food',
          confidence: 0.65,
          clarificationPrompt: `Which food item would you like to remove? I could not find a match in your inventory for this command.`,
        };
      }

      return {
        rawTranscript: raw,
        intent: 'remove_food',
        confidence: 0.94,
        foodName: matchedItem.name,
        location: matchedItem.location,
        quantity: matchedItem.quantity,
        unit: matchedItem.unit,
        previewSummary: `Remove "${matchedItem.name}" (${matchedItem.quantity} ${matchedItem.unit}) from ${matchedItem.location}.`,
        actionPayload: {
          action: 'remove',
          existingItemId: matchedItem.id,
        },
      };
    }

    // 5. Check for Add Intent (e.g. "Add two apples to the fridge", "I am putting milk in the refrigerator")
    if (
      text.includes('add') ||
      text.includes('putting') ||
      text.includes('put') ||
      text.includes('store') ||
      text.includes('bought') ||
      text.includes('place')
    ) {
      const { quantity, unit } = this.extractQuantityAndUnit(text);
      const location = this.extractLocation(text, 'Refrigerator');
      const foodName = this.extractFoodNameForAdd(text);

      if (!foodName || foodName.length < 2) {
        return {
          rawTranscript: raw,
          intent: 'add_food',
          confidence: 0.5,
          clarificationPrompt: 'I heard you want to add food, but what is the food item name? (e.g., "Add 2 apples to the fridge")',
        };
      }

      const category = this.guessCategory(foodName);
      const guideline = DEFAULT_STORAGE_GUIDELINES[category];
      const shelfLifeDays = guideline ? guideline.defaultDays : 7;

      const newItem: Partial<FoodItem> = {
        name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
        category,
        quantity: quantity || 1,
        unit: unit || 'items',
        location,
        estimatedShelfLifeDays: shelfLifeDays,
        estimatedExpiryDate: getRelativeDate(shelfLifeDays),
        storageGuidance: guideline ? guideline.guidance : 'Store appropriately and monitor freshness.',
        status: 'Fresh',
        notes: 'Added via Voice Assistant demo',
      };

      return {
        rawTranscript: raw,
        intent: 'add_food',
        confidence: 0.88,
        foodName: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        location: newItem.location,
        category: newItem.category,
        previewSummary: `Add ${newItem.quantity} ${newItem.unit} of "${newItem.name}" to ${newItem.location} (Category: ${newItem.category}, Est. Shelf Life: ${shelfLifeDays} days).`,
        actionPayload: {
          action: 'add',
          itemData: newItem,
        },
      };
    }

    // Unrecognized intent
    return {
      rawTranscript: raw,
      intent: 'unknown',
      confidence: 0.2,
      clarificationPrompt: `Command not recognized by the demo parser. Try commands like:
• "Add two apples to the fridge"
• "I am putting milk in the refrigerator"
• "Move the chicken to the freezer"
• "Remove the apples from the fridge"
• "What food is expiring soon?"`,
    };
  }

  private extractLocation(text: string, defaultLoc: StorageLocation = 'Refrigerator'): StorageLocation {
    if (text.includes('freezer') || text.includes('freeze') || text.includes('ice box')) {
      return 'Freezer';
    }
    if (text.includes('crisper') || text.includes('pantry') || text.includes('drawer') || text.includes('vegetable')) {
      return 'Pantry/Crisper';
    }
    if (text.includes('fridge') || text.includes('refrigerator') || text.includes('cooler')) {
      return 'Refrigerator';
    }
    return defaultLoc;
  }

  private extractQuantityAndUnit(text: string): { quantity: number; unit: UnitType } {
    let quantity = 1;
    let unit: UnitType = 'items';

    // Check for units
    if (text.includes(' kg ') || text.includes(' kilos') || text.includes(' kilo') || text.includes(' kilogram')) {
      unit = 'kg';
    } else if (text.includes(' g ') || text.includes(' grams') || text.includes(' gram')) {
      unit = 'g';
    } else if (text.includes(' ml ') || text.includes(' milliliters')) {
      unit = 'ml';
    } else if (text.includes(' l ') || text.includes(' liters') || text.includes(' liter') || text.includes(' litre')) {
      unit = 'L';
    } else if (text.includes(' pack') || text.includes(' packets') || text.includes(' packet')) {
      unit = 'packs';
    } else if (text.includes(' slice') || text.includes(' slices')) {
      unit = 'slices';
    } else if (text.includes(' bottle') || text.includes(' bottles')) {
      unit = 'bottles';
    } else if (text.includes(' can ') || text.includes(' cans')) {
      unit = 'cans';
    }

    // Check for numbers
    const numMatch = text.match(/\b\d+(\.\d+)?\b/);
    if (numMatch) {
      quantity = parseFloat(numMatch[0]);
      return { quantity, unit };
    }

    // Check word numbers
    for (const [word, num] of Object.entries(WORD_TO_NUMBER)) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(text)) {
        quantity = num;
        break;
      }
    }

    return { quantity, unit };
  }

  private extractFoodNameForAdd(text: string): string {
    // Clean out command keywords, prepositions, numbers, units, locations
    const stopWords = [
      'i am', 'i\'m', 'putting', 'put', 'add', 'storing', 'store', 'bought', 'place',
      'into the', 'in the', 'to the', 'from the', 'in', 'into', 'to', 'from',
      'the', 'some', 'my', 'a', 'an',
      'fridge', 'refrigerator', 'freezer', 'crisper', 'pantry',
      'grams', 'gram', 'kg', 'kilos', 'liters', 'liter', 'packs', 'pack', 'slices', 'bottles', 'cans',
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'dozen'
    ];

    let cleaned = text;
    // Remove digits
    cleaned = cleaned.replace(/\b\d+(\.\d+)?\b/g, '');

    for (const sw of stopWords) {
      const regex = new RegExp(`\\b${sw}\\b`, 'gi');
      cleaned = cleaned.replace(regex, ' ');
    }

    // Trim and clean extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  private findMatchingItem(text: string, inventory: FoodItem[]): FoodItem | undefined {
    // Sort inventory by longest name first to match "Organic Baby Spinach" before "Spinach"
    const sorted = [...inventory].sort((a, b) => b.name.length - a.name.length);

    for (const item of sorted) {
      const itemName = item.name.toLowerCase();
      // Direct substring match
      if (text.includes(itemName)) {
        return item;
      }
      // Single word match (e.g. "chicken" matches "Chicken Breast Fillets")
      const words = itemName.split(' ').map((w) => w.trim()).filter((w) => w.length > 3);
      for (const word of words) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
          return item;
        }
      }
    }
    return undefined;
  }

  private guessCategory(foodName: string): FoodCategory {
    const lower = foodName.toLowerCase();
    for (const [key, cat] of Object.entries(COMMON_CATEGORIES)) {
      if (lower.includes(key)) {
        return cat;
      }
    }
    return 'Produce'; // safe default
  }
}

export const demoVoiceParser = new DemoVoiceParser();
