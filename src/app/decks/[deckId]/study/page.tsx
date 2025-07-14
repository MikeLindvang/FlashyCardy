import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckWithCards } from "@/db/queries/deck-queries";
import { StudySession } from "./study-session";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  // Get the deckId from params
  const { deckId } = await params;
  const deckIdNumber = parseInt(deckId, 10);

  // Check authentication - redirect if not authenticated
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Validate deckId is a valid number
  if (isNaN(deckIdNumber)) {
    notFound();
  }

  // Fetch deck with cards using query helper, ensuring user ownership
  const deckWithCards = await getDeckWithCards(deckIdNumber, userId);

  // If deck not found or user doesn't own it, show 404
  if (!deckWithCards) {
    notFound();
  }

  const { cards, ...deck } = deckWithCards;

  // Redirect if no cards to study
  if (cards.length === 0) {
    redirect(`/decks/${deckId}`);
  }

  return (
    <main className="min-h-screen bg-background">
      <StudySession deck={deck} cards={cards} />
    </main>
  );
} 