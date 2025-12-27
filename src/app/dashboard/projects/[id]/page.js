"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ContentCard from "@/components/dashboard/ContentCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, FolderOpen } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}/contents`);
        const data = await response.json();

        if (response.ok) {
          setProject(data.project);
          setContents(data.contents);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const handleDelete = (contentId) => {
    setContents(contents.filter((item) => item.id !== contentId));
  };

  const handleToggleFavorite = (contentId, isFavorite) => {
    setContents(
      contents.map((item) =>
        item.id === contentId ? { ...item, isFavorite } : item
      )
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
        <Button
          onClick={() => router.push("/dashboard/projects")}
          className="mt-4"
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/projects")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {contents.length} items
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {contents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No content in this project
          </h3>
          <p className="text-gray-600 mb-6">
            Assign content to this project from the Content Library
          </p>
          <Button onClick={() => router.push("/dashboard/content")}>
            Go to Content Library
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((item) => (
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
