"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/libs/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Acquirers", href: "/acquirers", icon: Building2 },
  { name: "Submerchants", href: "/submerchants", icon: ShoppingCart },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-background transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b px-6 py-5">
            <div className="flex items-center gap-3">
              <Image
                src="https://res.cloudinary.com/doy2qixs5/image/upload/v1771388340/kesh/kesh-logo-square_cwtlqj.jpg"
                alt="KESH Logo"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="text-lg font-bold text-foreground">KESH Admin</p>
                <p className="text-xs text-muted-foreground">
                  Internal dashboard
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t px-4 py-4">
            <p className="text-xs font-medium text-muted-foreground">
              KESH Admin v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
