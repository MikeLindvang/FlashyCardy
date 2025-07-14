import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckWithCards } from "@/db/queries/deck-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, BookOpen, Calendar, Edit, Trash2 } from "lucide-react";
import { AddCardForm } from "./add-card-form";
import { EditDeckForm } from "./edit-deck-form";

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
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

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Deck Header */}
      <Card className="mb-8 border-0 shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0">
          <section className="space-y-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-3xl font-bold text-foreground">
                {deck.name}
              </CardTitle>
              <Badge variant="outline">{cards.length} cards</Badge>
            </div>
            {deck.description && (
              <CardDescription className="text-base">
                {deck.description}
              </CardDescription>
            )}
            <CardDescription className="text-sm">
              Last updated {new Date(deck.updatedAt).toLocaleDateString()}
            </CardDescription>
          </section>
          <div className="flex items-center gap-2">
            <EditDeckForm deck={deck} />
            <AddCardForm deckId={deckIdNumber} />
          </div>
        </CardHeader>
      </Card>

      {/* Deck Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">{cards.length}</CardTitle>
            <CardDescription className="text-xs">
              Flashcards in this deck
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">0%</CardTitle>
            <CardDescription className="text-xs">
              Cards mastered
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Study</CardTitle>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">Never</CardTitle>
            <CardDescription className="text-xs">
              Days ago
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* Study Actions */}
      {cards.length > 0 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ready to Study?</CardTitle>
              <CardDescription>
                Start reviewing your flashcards to improve retention
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button size="lg" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Start Study Session
              </Button>
              <Button variant="outline" size="lg">
                Practice Mode
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Cards Section */}
      <section className="space-y-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-4">
            <CardTitle className="text-2xl font-semibold">Cards</CardTitle>
            <AddCardForm deckId={deckIdNumber} variant="outline">
              Add New Card
            </AddCardForm>
          </CardHeader>
        </Card>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg font-semibold mb-2">No cards yet</CardTitle>
              <CardDescription className="text-center mb-4">
                Add your first flashcard to start building this deck
              </CardDescription>
              <AddCardForm deckId={deckIdNumber} size="default">
                Add Your First Card
              </AddCardForm>
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">
                      {card.front}
                    </CardTitle>
                    <div className="flex items-center gap-1 ml-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 mb-3">
                    {card.back}
                  </CardDescription>
                  <CardDescription className="text-xs">
                    Created {new Date(card.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </section>
    </main>
  );
} 