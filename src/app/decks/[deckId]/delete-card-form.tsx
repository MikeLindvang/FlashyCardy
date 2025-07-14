"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { deleteCardAction } from "./actions";
import { type Card } from "@/db/schema";

interface DeleteCardFormProps {
  card: Card;
  deckId: number;
}

export function DeleteCardForm({ card, deckId }: DeleteCardFormProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteCardAction({
        id: card.id,
        deckId,
      });

      if (!result.success) {
        setError(result.error || "Failed to delete card");
        setIsDeleting(false);
      }
      // If successful, the page will revalidate and the component will unmount
    } catch (error) {
      console.error("Failed to delete card:", error);
      setError("An unexpected error occurred");
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Card</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Show card preview in confirmation */}
        <div className="my-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Front:</div>
              <div className="text-sm line-clamp-2">{card.front}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Back:</div>
              <div className="text-sm line-clamp-2">{card.back}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Card"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 