import { Sidebar } from "@/components/layout/Sidebar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-brand-500/30">
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[600px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-bl from-brand-300 to-transparent blur-[120px] rounded-full" />
        </div>
      <Sidebar role="MANAGER" />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500 fill-mode-both">
            {children}
        </div>
      </main>
    </div>
  );
}
