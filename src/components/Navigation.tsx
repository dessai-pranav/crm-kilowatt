"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  Workflow,
  Bot,
  Settings,
  Zap,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Customers 360", href: "/customers", icon: Users },
    { label: "Orders", href: "/orders", icon: ShoppingBag },
    { label: "Approvals & Outreach", href: "/communications", icon: MessageSquare },
    { label: "Workflows", href: "/workflows", icon: Workflow },
    { label: "AI Copilot", href: "/assistant", icon: Bot, isSpecial: true },
    { label: "WooCommerce Sync", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-sm shadow-amber-200 group-hover:scale-105 transition-transform duration-200">
                <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900">
                    Kilowatt
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-300 bg-amber-50 text-amber-900 font-semibold">
                    CRM
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium -mt-0.5 tracking-tight">
                  WooCommerce Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              if (item.isSpecial) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-amber-50 text-amber-950 border border-amber-200/80 hover:bg-amber-100 hover:border-amber-300"
                    }`}
                  >
                    <Bot className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-amber-600"}`} />
                    <span>{item.label}</span>
                    <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
