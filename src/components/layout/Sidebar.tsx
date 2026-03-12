"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, CheckSquare, Settings, Users, Briefcase, Calendar } from "lucide-react";
import { cn } from "lib/utils";

interface SidebarProps {
  role: "MANAGER" | "USER";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const managerLinks = [
    { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/manager/projects", label: "Projects", icon: Briefcase },
    { href: "/manager/users", label: "Users", icon: Users },
    { href: "/manager/allocations", label: "Allocations", icon: CheckSquare },
  ];

  const userLinks = [
    { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/user/allocations", label: "My Allocations", icon: Calendar },
  ];

  const links = role === "MANAGER" ? managerLinks : userLinks;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-surface/50 backdrop-blur-xl">
      <div className="flex h-16 items-center px-6 border-b border-border text-lg font-bold">
        <div className="flex items-center gap-2 text-gradient">
          <div className="h-6 w-6 rounded-md flex items-center justify-center text-xs shadow-md">
            TM
          </div>
          TaskMaster
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-6">
        <nav className="space-y-1.5 px-4">
          <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            {role} Portal
          </div>
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
