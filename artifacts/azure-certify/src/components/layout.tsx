import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Cloud, LayoutDashboard, History, Settings, LogOut, ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/history", icon: History, label: "Exam History" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar - Microsoft Azure aesthetic */}
      <div className="w-64 flex-shrink-0 bg-[#111111] border-r border-white/5 flex flex-col justify-between hidden md:flex z-10 shadow-2xl relative">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 text-primary">
            <Cloud className="h-8 w-8" strokeWidth={2.5} />
            <span className="font-display font-bold text-xl tracking-tight text-white">
              AzureCertify <span className="text-primary">Pro</span>
            </span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary font-medium shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                  {item.label}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold shadow-lg">
              JS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">John Smith</span>
              <span className="text-xs text-muted-foreground">Pro Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50 z-20"></div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
