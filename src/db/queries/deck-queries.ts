import { db } from "@/db";
import { decksTable, cardsTable, type NewDeck, type Deck } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getUserDecks(userId: string) {
  return await db.select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt));
}

export async function getDeckById(deckId: number) {
  const [deck] = await db.select()
    .from(decksTable)
    .where(eq(decksTable.id, deckId));
  return deck || null;
}

export async function getDeckByIdAndUser(deckId: number, userId: string) {
  const [deck] = await db.select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
  return deck || null;
}

export async function getDeckWithCards(deckId: number, userId: string) {
  const [deck] = await db.select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
    
  if (!deck) return null;
  
  const cards = await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
    
  return { ...deck, cards };
}

export async function createDeck(deckData: NewDeck) {
  const [newDeck] = await db.insert(decksTable)
    .values(deckData)
    .returning();
  return newDeck;
}

export async function updateDeck(deckId: number, updates: Partial<Deck>) {
  const [updatedDeck] = await db.update(decksTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(decksTable.id, deckId))
    .returning();
  return updatedDeck;
}

export async function deleteDeck(deckId: number) {
  await db.delete(decksTable)
    .where(eq(decksTable.id, deckId));
}

export async function deleteDeckByIdAndUser(deckId: number, userId: string) {
  await db.delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
} 