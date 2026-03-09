"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Users, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  _count: { members: number; tasks: number };
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/manager/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      } else if (res.status === 401 || res.status === 403) {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [router]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/manager/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      });

      if (res.ok) {
        setNewProjectName("");
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your teams and oversee project execution.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className=" hover:bg-brand-500 shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/manager/projects/${project.id}`}>
            <Card className="glass cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-brand-500/50 group h-full">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 group-hover:scale-110 transition-transform">
                    <Briefcase className="h-5 w-5" />
                  </div>
                </div>
                <CardTitle className="text-xl mt-4 group-hover:text-brand-600 transition-colors">{project.name}</CardTitle>
                <CardDescription>Click to manage board and team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                    <Users className="h-4 w-4" />
                    {project._count.members} Members
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                    <CheckSquare className="h-4 w-4" />
                    {project._count.tasks} Tasks
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/30 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground ring-1 ring-border mb-4">
             <Briefcase className="h-8 w-8 opacity-50" />
          </div>
          <h3 className="text-xl font-medium">No projects yet</h3>
          <p className="mt-2 text-muted-foreground mb-6 max-w-sm text-balance">
            Get started by creating your first project to organize tasks and invite team members.
          </p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="glass">
            Create your first project
          </Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-6">
          <div className="space-y-2 ">
            <label className="text-sm font-medium leading-none" htmlFor="name">
              Project Name
            </label>
            <Input
              id="name"
              placeholder="e.g. Q3 Marketing Campaign"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
