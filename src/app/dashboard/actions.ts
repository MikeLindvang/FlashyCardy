"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createDeck } from "@/db/queries/deck-queries";
import { revalidatePath } from "next/cache";
import { type NewDeck } from "@/db/schema";

// Zod schema for deck creation
const CreateDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
});

// TypeScript type derived from schema
export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  try {
    // Validate input data
    const validatedData = CreateDeckSchema.parse(input);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
    
    // Create new deck using query helper
    const newDeckData: NewDeck = {
      ...validatedData,
      userId,
    };
    
    const newDeck = await createDeck(newDeckData);
    
    // Revalidate the dashboard page to show the new deck
    revalidatePath("/dashboard");
    
    return { success: true, deck: newDeck };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to create deck" };
  }
} 