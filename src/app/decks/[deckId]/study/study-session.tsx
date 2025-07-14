"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  RotateCcw, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff,
  CheckCircle 
} from "lucide-react";
import type { Deck, Card as CardType } from "@/db/schema";

interface StudySessionProps {
  deck: Deck;
  cards: CardType[];
}

export function StudySession({ deck, cards }: StudySessionProps) {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState(cards);
  const [isCompleted, setIsCompleted] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set<number>());

  const currentCard = studyCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / studyCards.length) * 100;

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        handleFlip();
      } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
        event.preventDefault();
        handlePrevious();
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentCardIndex, isFlipped]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && !studiedCards.has(currentCard.id)) {
      setStudiedCards(prev => new Set([...prev, currentCard.id]));
    }
  };

  const handleNext = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setStudiedCards(new Set());
  };

  if (isCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Study Session Complete!</h1>
            <p className="text-muted-foreground">
              You've reviewed all {studyCards.length} cards in "{deck.name}"
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button onClick={handleRestart} variant="default" size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Study Again
            </Button>
            <Link href={`/decks/${deck.id}`}>
              <Button variant="outline" size="lg">
                Back to Deck
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/decks/${deck.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
        
        <div className="text-center">
          <h1 className="text-xl font-semibold">{deck.name}</h1>
          <p className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {studyCards.length}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleShuffle}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle
          </Button>
          <Button
            onClick={handleRestart}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <Badge variant="secondary">
            {studiedCards.size} / {studyCards.length} studied
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <Card 
          className="min-h-[400px] cursor-pointer transition-all duration-200 hover:shadow-lg"
          onClick={handleFlip}
        >
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant={isFlipped ? "default" : "secondary"}>
                {isFlipped ? "Answer" : "Question"}
              </Badge>
              {isFlipped ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px] p-8">
            <CardTitle className="text-2xl text-center leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </CardTitle>
          </CardContent>
        </Card>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Click the card or press <kbd className="bg-muted px-2 py-1 rounded text-xs">Space</kbd> to flip
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-center space-y-1">
          <Button
            onClick={handleFlip}
            variant={isFlipped ? "secondary" : "default"}
            size="lg"
            className="gap-2"
          >
            {isFlipped ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isFlipped ? "Hide Answer" : "Show Answer"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Use <kbd className="bg-muted px-1 rounded text-xs">←</kbd> and <kbd className="bg-muted px-1 rounded text-xs">→</kbd> to navigate
          </p>
        </div>

        <Button
          onClick={handleNext}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          {currentCardIndex === studyCards.length - 1 ? "Finish" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 