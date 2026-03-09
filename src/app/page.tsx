import Link from "next/link";
import { ArrowRight, LayoutDashboard, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="text-gradient font-semibold text-2xl">TaskMaster</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="shadow-xl shadow-brand-500/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 opacity-20 dark:opacity-30 pointer-events-none">
            <div className="absolute inset-0  blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
          </div>

          <div className="container relative mx-auto px-4 text-center md:px-8">
            <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              
              <h1 className="mb-8 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                Manage work. <br />
                <span className="text-gradient">Deliver faster.</span>
              </h1>
              
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                The premium project management platform built for modern teams.
                Experience seamless collaboration with our ultra-fast, role-based Kanban boards.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-brand-500/20">
                    Start for free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto glass border-border/50">
                    Sign in to Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 bg-muted/30 py-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gradient">Why TaskMaster?</h2>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  icon: LayoutDashboard,
                  title: "Intuitive Kanban",
                  description: "Drag and drop tasks effortlessly. Visualize your workflow with our premium, glassmorphic board interface."
                },
                {
                  icon: Users,
                  title: "Role-Based Access",
                  description: "Secure workspaces with strict Manager and User portals. Control exactly who sees what."
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Built on Next.js 15 and PostgreSQL. Experience real-time speed with zero loading spinners."
                }
              ].map((feature, i) => (
                <div key={i} className="glass-card p-8 text-center sm:text-left flex flex-col items-center sm:items-start transition-transform hover:-translate-y-1">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/20">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-10 bg-surface/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center text-muted-foreground md:px-8">
          <p>&copy; {new Date().getFullYear()} TaskMaster Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
