"use client";

import { useState, useEffect } from "react";
import ContentCard from "@/components/dashboard/ContentCard";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Heart,
  Search,
  Filter,
} from "lucide-react";

const contentTypes = [
  { id: "all", name: "All Content", icon: FileText },
  { id: "blog", name: "Blog Posts", icon: FileText },
  { id: "social", name: "Social Media", icon: MessageSquare },
  { id: "email", name: "Emails", icon: Mail },
  { id: "image", name: "AI Images", icon: ImageIcon },
];

export default function ContentPage() {
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch content
  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      if (showFavorites) params.append("favorites", "true");

      const response = await fetch(`/api/content/list?${params}`);
      const data = await response.json();

      if (response.ok) {
        setContent(data.content);
        setFilteredContent(data.content);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [selectedType, showFavorites]);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContent(content);
    } else {
      const filtered = content.filter(
        (item) =>
          item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.result.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContent(filtered);
    }
  }, [searchQuery, content]);

  const handleDelete = (contentId) => {
    setContent(content.filter((item) => item.id !== contentId));
    setFilteredContent(filteredContent.filter((item) => item.id !== contentId));
  };

  const handleToggleFavorite = (contentId, isFavorite) => {
    const updateContent = (items) =>
      items.map((item) =>
        item.id === contentId ? { ...item, isFavorite } : item
      );

    setContent(updateContent(content));
    setFilteredContent(updateContent(filteredContent));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Content</h1>
        <p className="text-gray-600 mt-2">
          View and manage all your generated content
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedType === type.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {type.name}
                </button>
              );
            })}
          </div>

          {/* Favorites Filter */}
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              showFavorites
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Heart
              className={`w-4 h-4 mr-2 ${showFavorites ? "fill-current" : ""}`}
            />
            Favorites Only
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Content</div>
          <div className="text-3xl font-bold text-gray-900">
            {content.length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Favorites</div>
          <div className="text-3xl font-bold text-gray-900">
            {content.filter((item) => item.isFavorite).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Showing</div>
          <div className="text-3xl font-bold text-gray-900">
            {filteredContent.length}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading content...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No content found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "Try adjusting your search query"
              : "Start generating content to see it here"}
          </p>
          <Button
            onClick={() => (window.location.href = "/dashboard/generate")}
          >
            Generate Content
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
