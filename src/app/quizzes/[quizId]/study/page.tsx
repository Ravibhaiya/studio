
"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";

export default function QuizStudyPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-6">
      <Construction className="w-24 h-24 text-primary mb-8 animate-pulse" />
      <h1 className="text-3xl font-bold text-foreground mb-4">Quiz Study - Coming Soon!</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        The study feature for quizzes is currently under construction. Please check back later!
      </p>
      <p className="text-sm text-muted-foreground mb-2">Quiz ID: {quizId}</p>
      <Button asChild variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-shadow">
        <Link href={`/quizzes/${quizId}`}>
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Quiz Details
        </Link>
      </Button>
    </div>
  );
}
