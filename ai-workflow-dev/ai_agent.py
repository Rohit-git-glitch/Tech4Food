from models import FoodCommand
from config import client, GEMINI_MODEL


def understand_command(text: str) -> FoodCommand:
    """Convert a natural-language food command into structured data."""

    prompt = f"""
You are the FoodGuard smart-fridge command interpretation agent.

Interpret the user's command and return data matching the requested schema.

Rules:
- Identify whether the user wants to add, remove, or move food.
- Extract the food name, quantity, unit, and storage location.
- Supported locations: Refrigerator, Freezer, Pantry.
- For a move, location is the current location and
  destination_location is the new location.
- Never invent a quantity or location.
- If essential information is missing or ambiguous, set
  clarification_needed to true and ask a short question.
- For unrelated or unclear commands, use action "unknown".
- Do not claim that food was actually added or removed.
  This agent only interprets the command.
- Return category, confidence, and a shelf-life recommendation when the food
  is identifiable. Use null for an unknown shelf-life recommendation.
- Set date_added to the current UTC timestamp when adding food.

User command: {text}
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": FoodCommand,
        },
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response.")

    result = FoodCommand.model_validate_json(response.text)
    if result.quantity is not None and result.quantity <= 0:
        raise ValueError("Quantity must be greater than zero.")
    if result.action == "unknown" or not result.food_name.strip():
        result.clarification_needed = True

        if not result.clarification_question:
            result.clarification_question = (
                "Which food item and action do you mean?"
            )

    return result


if __name__ == "__main__":
    while True:
        command = input("\nEnter a food command (or 'exit'): ").strip()

        if command.lower() == "exit":
            break

        if not command:
            continue

        try:
            result = understand_command(command)
            print("\nFoodGuard AI result:")
            print(result.model_dump_json(indent=2))
        except Exception as error:
            print(f"\nError: {error}")