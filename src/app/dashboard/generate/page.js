"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ContentGenerator from "@/components/dashboard/ContentGenerator";

export default function GeneratePage() {
  const { data: session, update } = useSession();
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch fresh credit count from database
  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      const data = await response.json();
      if (response.ok) {
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleCreditsUpdate = async (newCredits) => {
    setCredits(newCredits);
    // Update session
    await update();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate Content</h1>
        <p className="text-gray-600 mt-2">
          Create amazing content with AI in seconds
        </p>
      </div>

      <ContentGenerator
        userCredits={credits}
        onCreditsUpdate={handleCreditsUpdate}
      />
    </div>
  );
}
