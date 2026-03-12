"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Allocation {
  id: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
  project: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export default function UserAllocationsPage() {
  const router = useRouter();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const res = await fetch("/api/allocations", {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch allocations");
        }

        const data = await res.json();
        setAllocations(data.allocations || []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocations();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Allocations</h1>
        <p className="text-muted-foreground mt-1">View your resource allocations across projects.</p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </CardContent>
        </Card>
      )}

      {allocations.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-xl bg-surface/30 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No allocations assigned yet.</p>
          <p className="text-sm">Contact your manager to get allocated to a project.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allocations.map((allocation) => (
            <Card key={allocation.id} className="glass hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-1">{allocation.project.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Allocation</span>
                    <Badge variant="default">{allocation.allocationPercentage}%</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all"
                      style={{ width: `${allocation.allocationPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(allocation.startDate).toLocaleDateString()} -{" "}
                      {new Date(allocation.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Duration: {Math.ceil(
                      (new Date(allocation.endDate).getTime() -
                        new Date(allocation.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} days
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
