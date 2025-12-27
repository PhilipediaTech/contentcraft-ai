"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate, truncateText } from "@/lib/utils";
import {
  FileText,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Heart,
  Copy,
  Trash2,
  Eye,
  Download,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

const contentIcons = {
  blog: FileText,
  social: MessageSquare,
  email: Mail,
  image: ImageIcon,
};

const contentColors = {
  blog: "bg-purple-100 text-purple-600",
  social: "bg-blue-100 text-blue-600",
  email: "bg-green-100 text-green-600",
  image: "bg-pink-100 text-pink-600",
};

export default function ContentCard({ content, onDelete, onToggleFavorite }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = contentIcons[content.type] || FileText;
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [projects, setProjects] = useState([]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content.result);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this content?")) {
      try {
        const response = await fetch(`/api/content/delete?id=${content.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Content deleted!");
          if (onDelete) onDelete(content.id);
        } else {
          toast.error("Failed to delete content");
        }
      } catch (error) {
        toast.error("Failed to delete content");
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch("/api/content/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: content.id,
          isFavorite: !content.isFavorite,
        }),
      });

      if (response.ok) {
        toast.success(
          content.isFavorite ? "Removed from favorites" : "Added to favorites"
        );
        if (onToggleFavorite) onToggleFavorite(content.id, !content.isFavorite);
      } else {
        toast.error("Failed to update favorite");
      }
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  useEffect(() => {
    // Fetch projects for assignment
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects/list");
        const data = await response.json();
        if (response.ok) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleAssignProject = async (projectId) => {
    try {
      const response = await fetch("/api/content/assign-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: content.id,
          projectId: projectId,
        }),
      });

      if (response.ok) {
        toast.success(
          projectId ? "Assigned to project!" : "Removed from project!"
        );
        setShowProjectMenu(false);
      } else {
        toast.error("Failed to assign project");
      }
    } catch (error) {
      toast.error("Failed to assign project");
    }
  };

  return (
    <Card className="hover:shadow-lg transition">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                contentColors[content.type]
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-gray-900 capitalize">
                {content.type}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(content.createdAt)}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition ${
              content.isFavorite
                ? "text-red-500 hover:bg-red-50"
                : "text-gray-400 hover:bg-gray-100 hover:text-red-500"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${content.isFavorite ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Prompt */}
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 mb-1">Prompt:</div>
          <div className="text-sm text-gray-600">
            {truncateText(content.prompt, 100)}
          </div>
        </div>

        {/* Result Preview */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Result:</div>
          {content.type === "image" ? (
            <img
              src={content.result}
              alt="Generated"
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {isExpanded ? content.result : truncateText(content.result, 150)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {content.type !== "image" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {isExpanded ? "Show Less" : "Show More"}
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectMenu(!showProjectMenu)}
              >
                <FolderOpen className="w-4 h-4 mr-1" />
                Project
              </Button>

              {showProjectMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] z-10">
                  <div className="text-xs font-medium text-gray-700 mb-2 px-2">
                    Assign to project:
                  </div>
                  {projects.length === 0 ? (
                    <div className="text-xs text-gray-500 px-2 py-1">
                      No projects yet
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAssignProject(null)}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                      >
                        None
                      </button>
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleAssignProject(project.id)}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                        >
                          {project.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {content.type === "image" && (
              <a href={content.result} download>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </a>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Credits Badge */}
        <div className="mt-3 inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
          {content.creditsUsed} credits used
        </div>
      </CardContent>
    </Card>
  );
}
