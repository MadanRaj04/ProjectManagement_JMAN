"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Project {
  project: {
    id: string;
    name: string;
  };
}

interface Allocation {
  id: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
  project: {
    id: string;
    name: string;
  };
}

interface UserData {
  projects: Project[];
  allocations: Allocation[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [data, setData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include"
        });
        if (res.ok) {
          const result = await res.json();
          
          // Fetch allocations
          const allocRes = await fetch("/api/allocations", {
            credentials: "include"
          });
          
          const allocData = allocRes.ok ? await allocRes.json() : { allocations: [] };
          
          // Merge projects from both project membership and allocations
          const projectsFromMembership = result.user.projects || [];
          const projectsFromAllocations = allocData.allocations || [];
          
          // Create a map to deduplicate projects by ID
          const projectMap = new Map<string, Project>();
          
          // Add projects from membership
          projectsFromMembership.forEach((pm: any) => {
            projectMap.set(pm.project.id, pm);
          });
          
          // Add projects from allocations
          projectsFromAllocations.forEach((alloc: Allocation) => {
            if (!projectMap.has(alloc.project.id)) {
              projectMap.set(alloc.project.id, {
                project: alloc.project
              });
            }
          });
          
          setData({
             projects: Array.from(projectMap.values()),
             allocations: allocData.allocations || []
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Workspace</h1>
        <p className="text-muted-foreground mt-1">View your assigned projects.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
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
                      <Card className="glass cursor-pointer transition-all duration-300 hover:shadow-md">
                          <CardHeader className="py-4">
                             <CardTitle className="text-lg transition-colors">
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resource Allocations
          </h2>
          <Link href="/user/allocations">
            <Button size="sm" variant="outline">View All</Button>
          </Link>
        </div>
        {(data.allocations || []).length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                No allocations assigned yet. Contact your manager to get allocated to a project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(data.allocations || []).slice(0, 4).map((allocation) => (
              <Card key={allocation.id} className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm line-clamp-1">{allocation.project.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Allocation</span>
                      <Badge variant="default" className="text-xs">{allocation.allocationPercentage}%</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all"
                        style={{ width: `${allocation.allocationPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(allocation.startDate).toLocaleDateString()} - {new Date(allocation.endDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
