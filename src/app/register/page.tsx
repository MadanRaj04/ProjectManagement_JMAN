"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [role, setRole] = useState<"USER" | "MANAGER">("USER");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.user.role === "MANAGER") {
        router.push("/manager/dashboard");
      } else {
        router.push("/user/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        
        <Card className="glass-card border-none shadow-2xl">
          <CardHeader className="space-y-1 text-center">
             <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg shadow-md">
              <span className="text-xl font-bold">TM</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign up to start managing your projects
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRole("USER")}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${role === "USER" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Team Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("MANAGER")}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${role === "MANAGER" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Manager
                  </button>
              </div>

               {role === "MANAGER" && (
                <p className="text-[13px] text-muted-foreground bg-brand-500/10 p-3 rounded-md border border-brand-500/20">
                   Note: You must be pre-whitelisted by an administrator to register a Manager account.
                </p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="username">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button className="w-full" type="submit" isLoading={isLoading}>
                Create Account
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
