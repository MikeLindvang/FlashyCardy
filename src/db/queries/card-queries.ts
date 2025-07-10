import { db } from "@/db";
import { cardsTable, decksTable, type NewCard, type Card } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getCardsByDeckId(deckId: number) {
  return await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
}

export async function getCardById(cardId: number) {
  const [card] = await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId));
  return card || null;
}

export async function getCardByIdAndDeckOwner(cardId: number, userId: string) {
  const [card] = await db.select({
    id: cardsTable.id,
    deckId: cardsTable.deckId,
    front: cardsTable.front,
    back: cardsTable.back,
    createdAt: cardsTable.createdAt,
    updatedAt: cardsTable.updatedAt,
  })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ));
  return card || null;
}

export async function createCard(cardData: NewCard) {
  const [newCard] = await db.insert(cardsTable)
    .values(cardData)
    .returning();
  return newCard;
}

export async function updateCard(cardId: number, updates: Partial<Card>) {
  const [updatedCard] = await db.update(cardsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId))
    .returning();
  return updatedCard;
}

export async function updateCardByIdAndDeckOwner(cardId: number, userId: string, updates: Partial<Card>) {
  // First verify the card belongs to a deck owned by the user
  const cardExists = await getCardByIdAndDeckOwner(cardId, userId);
  if (!cardExists) {
    throw new Error("Card not found or not authorized");
  }

  const [updatedCard] = await db.update(cardsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId))
    .returning();
  return updatedCard;
}

export async function deleteCard(cardId: number) {
  await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}

export async function deleteCardByIdAndDeckOwner(cardId: number, userId: string) {
  // First verify the card belongs to a deck owned by the user
  const cardExists = await getCardByIdAndDeckOwner(cardId, userId);
  if (!cardExists) {
    throw new Error("Card not found or not authorized");
  }

  await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}

export async function deleteCardsByDeckId(deckId: number) {
  await db.delete(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
} 