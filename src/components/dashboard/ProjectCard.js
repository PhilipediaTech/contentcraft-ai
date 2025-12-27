"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { FolderOpen, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProjectCard({ project, onDelete }) {
  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete "${project.name}"? Content will not be deleted.`
      )
    ) {
      try {
        const response = await fetch(`/api/projects/delete?id=${project.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Project deleted!");
          if (onDelete) onDelete(project.id);
        } else {
          toast.error("Failed to delete project");
        }
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  return (
    <Card className="hover:shadow-lg transition">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>{project.name}</CardTitle>
              <div className="text-xs text-gray-500 mt-1">
                Created {formatDate(project.createdAt)}
              </div>
            </div>
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
      </CardHeader>

      <CardContent>
        {project.description && (
          <p className="text-sm text-gray-600 mb-4">{project.description}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{project.contentCount} items</span>
          </div>

          <Link href={`/dashboard/projects/${project.id}`}>
            <Button size="sm">View Project</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
