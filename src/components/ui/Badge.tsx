import * as React from "react";
import { cn } from "lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground",
    success: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
