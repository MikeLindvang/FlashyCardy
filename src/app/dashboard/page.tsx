import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDecks } from "@/db/queries/deck-queries";
import { type Deck } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  // Check authentication - redirect if not authenticated
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Fetch user's decks using query helper
  const decks = await getUserDecks(userId);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <Card className="mb-8 border-0 shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0">
          <section>
            <CardTitle className="text-3xl font-bold text-foreground">Dashboard</CardTitle>
            <CardDescription className="mt-1">
              Manage your flashcard decks and track your progress
            </CardDescription>
          </section>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Deck
          </Button>
        </CardHeader>
      </Card>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">{decks.length}</CardTitle>
            <CardDescription className="text-xs">
              Flashcard decks created
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">0</CardTitle>
            <CardDescription className="text-xs">
              Cards across all decks
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">0</CardTitle>
            <CardDescription className="text-xs">
              Days in a row
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* Decks Section */}
      <section className="space-y-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-4">
            <CardTitle className="text-2xl font-semibold">Your Decks</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
        </Card>

        {decks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg font-semibold mb-2">No decks yet</CardTitle>
              <CardDescription className="text-center mb-4">
                Create your first flashcard deck to get started with studying
              </CardDescription>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <Card key={deck.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <section className="flex items-center justify-between">
                    <CardTitle className="text-lg">{deck.name}</CardTitle>
                    <Badge variant="outline">0 cards</Badge>
                  </section>
                  {deck.description && (
                    <CardDescription className="line-clamp-2">
                      {deck.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <section className="flex items-center justify-between text-sm text-muted-foreground">
                    <CardDescription className="text-sm">
                      Created {new Date(deck.createdAt).toLocaleDateString()}
                    </CardDescription>
                    <Button variant="ghost" size="sm">
                      Study
                    </Button>
                  </section>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </section>
    </main>
  );
} 