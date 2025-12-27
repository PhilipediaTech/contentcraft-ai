"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import {
  FileText,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Loader2,
  Copy,
  Download,
  Heart,
  AlertCircle,
} from "lucide-react";

const contentTypes = [
  {
    id: "blog",
    name: "Blog Post",
    icon: FileText,
    description: "Generate engaging blog posts",
    credits: 5,
    placeholder: "Write a blog post about sustainable living tips",
  },
  {
    id: "social",
    name: "Social Media",
    icon: MessageSquare,
    description: "Create social media captions",
    credits: 1,
    placeholder: "Create an Instagram caption about morning coffee",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    description: "Write professional emails",
    credits: 2,
    placeholder: "Write a professional follow-up email after a job interview",
  },
  {
    id: "image",
    name: "AI Image",
    icon: ImageIcon,
    description: "Generate AI images",
    credits: 10,
    placeholder: "A serene landscape with mountains at sunset, digital art",
  },
];

export default function ContentGenerator({ userCredits, onCreditsUpdate }) {
  const [selectedType, setSelectedType] = useState("blog");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const currentType = contentTypes.find((t) => t.id === selectedType);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setGeneratedContent("");
    setGeneratedImage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Update demo mode status
      setIsDemoMode(data.demoMode || false);

      // Show demo mode message if in demo
      if (data.demoMode) {
        toast.success(
          "Demo content generated! (Add OpenAI API key for real AI)"
        );
      }

      if (selectedType === "image") {
        setGeneratedImage(data.result);
        if (!data.demoMode) {
          toast.success("Image generated successfully!");
        }
      } else {
        setGeneratedContent(data.result);
        if (!data.demoMode) {
          toast.success("Content generated successfully!");
        }
      }

      // Update credits
      if (onCreditsUpdate) {
        onCreditsUpdate(data.creditsRemaining);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          prompt,
          result: selectedType === "image" ? generatedImage : generatedContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success("Content saved to library!");
    } catch (error) {
      toast.error("Failed to save content");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Demo Mode Warning - Only show if in demo mode */}
        {isDemoMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Demo Mode Active
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You're using mock content generation. Add your OpenAI API
                    key to{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      .env.local
                    </code>{" "}
                    for real AI-powered content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Type Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        setPrompt("");
                        setGeneratedContent("");
                        setGeneratedImage("");
                      }}
                      className={`w-full flex items-start p-4 rounded-lg border-2 transition ${
                        selectedType === type.id
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mr-3 mt-0.5 ${
                          selectedType === type.id
                            ? "text-purple-600"
                            : "text-gray-600"
                        }`}
                      />
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-900">
                          {type.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {type.description}
                        </div>
                        <div className="text-xs text-purple-600 font-medium mt-1">
                          {type.credits} credits
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Credits Display */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Available Credits
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {userCredits}
                </div>

                {/* Reset Credits Button - Only in demo mode */}
                {isDemoMode && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/credits/reset", {
                          method: "POST",
                        });
                        const data = await response.json();
                        if (response.ok) {
                          onCreditsUpdate(data.creditsRemaining);
                          toast.success("Credits reset to 10!");
                        }
                      } catch (error) {
                        toast.error("Failed to reset credits");
                      }
                    }}
                    className="mt-3 w-full text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Reset Credits (Demo)
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate {currentType?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to create?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={currentType?.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <currentType.icon className="w-5 h-5 mr-2" />
                      Generate {currentType?.name}
                    </>
                  )}
                </Button>
              </div>

              {/* Output - Text Content */}
              {generatedContent && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Generated Content
                    </h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSave}>
                        <Heart className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="whitespace-pre-wrap text-gray-800">
                      {generatedContent}
                    </div>
                  </div>
                </div>
              )}

              {/* Output - Image */}
              {generatedImage && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Generated Image
                    </h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleSave}>
                        <Heart className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <a href={generatedImage} download>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!generatedContent && !generatedImage && !isLoading && (
                <div className="mt-6 text-center py-12 text-gray-500">
                  <currentType.icon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Your generated content will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
