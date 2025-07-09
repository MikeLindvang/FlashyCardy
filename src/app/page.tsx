import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
          FlashyCardy
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Your personal flashcard platform
        </p>
      </div>
      
      <SignedOut>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <SignInButton mode="modal">
            <Button size="lg" className="w-full sm:w-auto">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SignedIn>
    </div>
  );
}
