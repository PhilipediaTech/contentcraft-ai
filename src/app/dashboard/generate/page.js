"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import ContentGenerator from "@/components/dashboard/ContentGenerator";

export default function GeneratePage() {
  const { data: session, update } = useSession();
  const [credits, setCredits] = useState(session?.user?.creditsRemaining || 0);

  const handleCreditsUpdate = async (newCredits) => {
    setCredits(newCredits);
    // Update session
    await update({
      ...session,
      user: {
        ...session?.user,
        creditsRemaining: newCredits,
      },
    });
  };

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
