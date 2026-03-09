"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckSquare, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { TaskStatus } from "@prisma/client";

interface Project {
  project: {
    id: string;
    name: string;
  };
}

interface UserData {
  projects: Project[];
  tasks: any[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [data, setData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const result = await res.json();
          setData({
             projects: result.user.projects,
             tasks: result.user.assignedTasks
          });
        } else {
           router.push('/login');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Workspace</h1>
        <p className="text-muted-foreground mt-1">View your assigned projects and pending tasks.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            My Projects
          </h2>
          <div className="grid gap-4">
             {(data.projects || []).length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-xl bg-surface/30 text-muted-foreground">
                  No projects assigned. Waiting for an invite from your manager.
                </div>
             ) : (
                (data.projects || []).map((p) => (
                    <Link key={p.project.id} href={`/user/projects/${p.project.id}`}>
                        <Card className="glass cursor-pointer transition-all duration-300 hover:shadow-md hover:border-indigo-500/50 group">
                            <CardHeader className="py-4">
                               <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
                                   {p.project.name}
                               </CardTitle>
                               <CardDescription>Click to view board</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))
             )}
          </div>
        </div>

        <div className="space-y-4">
             <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-emerald-500" />
                My To-Do Tasks
            </h2>
             <div className="grid gap-4">
                {(data.tasks || []).filter((t: any) => t.status === TaskStatus.TODO).length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-xl bg-surface/30 text-muted-foreground">
                        You're all caught up! No pending To-Do tasks.
                    </div>
                ) : (
                    (data.tasks || [])
                        .filter((t: any) => t.status === TaskStatus.TODO)
                        .map((task: any) => (
                        <Card key={task.id} className="glass">
                            <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                                <Badge variant="warning">To Do</Badge>
                            </CardHeader>
                            <CardContent className="pb-4 pt-0">
                                <div className="text-sm border-t border-border mt-2 pt-2 text-muted-foreground break-all">
                                    Project ID: {task.projectId}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
             </div>
        </div>
      </div>
    </div>
  );
}