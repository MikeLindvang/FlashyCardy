"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCard, updateCardByIdAndDeckOwner, deleteCardByIdAndDeckOwner } from "@/db/queries/card-queries";
import { getDeckByIdAndUser, updateDeck } from "@/db/queries/deck-queries";
import { type NewCard } from "@/db/schema";

// Zod schema for card creation
const CreateCardSchema = z.object({
  front: z.string().min(1, "Front text is required").max(1000, "Front text too long"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text too long"),
  deckId: z.number().int().positive("Invalid deck ID"),
});

// Extract TypeScript type from schema
type CreateCardInput = z.infer<typeof CreateCardSchema>;

// Zod schema for deck update
const UpdateDeckSchema = z.object({
  id: z.number().int().positive("Invalid deck ID"),
  name: z.string().min(1, "Deck name is required").max(100, "Deck name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

// Extract TypeScript type from schema
type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

// Zod schema for card update
const UpdateCardSchema = z.object({
  id: z.number().int().positive("Invalid card ID"),
  front: z.string().min(1, "Front text is required").max(1000, "Front text too long"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text too long"),
  deckId: z.number().int().positive("Invalid deck ID"),
});

// Extract TypeScript type from schema
type UpdateCardInput = z.infer<typeof UpdateCardSchema>;

// Zod schema for card deletion
const DeleteCardSchema = z.object({
  id: z.number().int().positive("Invalid card ID"),
  deckId: z.number().int().positive("Invalid deck ID"),
});

// Extract TypeScript type from schema
type DeleteCardInput = z.infer<typeof DeleteCardSchema>;

export async function createCardAction(input: CreateCardInput) {
  try {
    // Validate input data
    const validatedData = CreateCardSchema.parse(input);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Verify deck ownership
    const deck = await getDeckByIdAndUser(validatedData.deckId, userId);
    if (!deck) {
      return { success: false, error: "Deck not found or access denied" };
    }
    
    // Create the card
    const newCardData: NewCard = {
      deckId: validatedData.deckId,
      front: validatedData.front,
      back: validatedData.back,
    };
    
    const newCard = await createCard(newCardData);
    
    // Revalidate the deck page to show the new card
    revalidatePath(`/decks/${validatedData.deckId}`);
    
    return { success: true, card: newCard, message: "Card added successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input", 
        errors: error.errors 
      };
    }
    
    console.error("Failed to create card:", error);
    return { success: false, error: "Failed to create card" };
  }
}

export async function updateDeckAction(input: UpdateDeckInput) {
  try {
    // Validate input data
    const validatedData = UpdateDeckSchema.parse(input);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Verify deck ownership
    const existingDeck = await getDeckByIdAndUser(validatedData.id, userId);
    if (!existingDeck) {
      return { success: false, error: "Deck not found or access denied" };
    }
    
    // Update the deck
    const updatedDeck = await updateDeck(validatedData.id, {
      name: validatedData.name,
      description: validatedData.description,
    });
    
    // Revalidate the deck page and dashboard to show updated data
    revalidatePath(`/decks/${validatedData.id}`);
    revalidatePath("/dashboard");
    
    return { success: true, deck: updatedDeck, message: "Deck updated successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input", 
        errors: error.errors 
      };
    }
    
    console.error("Failed to update deck:", error);
    return { success: false, error: "Failed to update deck" };
  }
}

export async function updateCardAction(input: UpdateCardInput) {
  try {
    // Validate input data
    const validatedData = UpdateCardSchema.parse(input);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Update the card with ownership validation
    const updatedCard = await updateCardByIdAndDeckOwner(
      validatedData.id, 
      userId, 
      {
        front: validatedData.front,
        back: validatedData.back,
      }
    );
    
    // Revalidate the deck page to show the updated card
    revalidatePath(`/decks/${validatedData.deckId}`);
    
    return { success: true, card: updatedCard, message: "Card updated successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input", 
        errors: error.errors 
      };
    }
    
    console.error("Failed to update card:", error);
    return { success: false, error: "Failed to update card" };
  }
}

export async function deleteCardAction(input: DeleteCardInput) {
  try {
    // Validate input data
    const validatedData = DeleteCardSchema.parse(input);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Delete the card with ownership validation
    await deleteCardByIdAndDeckOwner(validatedData.id, userId);
    
    // Revalidate the deck page to show the updated card list
    revalidatePath(`/decks/${validatedData.deckId}`);
    
    return { success: true, message: "Card deleted successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input", 
        errors: error.errors 
      };
    }
    
    console.error("Failed to delete card:", error);
    return { success: false, error: "Failed to delete card" };
  }
} 