"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import Image from "next/image";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (pathname?.startsWith("/auth")) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    if (token) {
      setIsAuthenticated(true);
    } else {
      router.push("/auth/login");
    }

    setIsLoading(false);
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="https://res.cloudinary.com/doy2qixs5/image/upload/v1771388340/kesh/kesh-logo-square_cwtlqj.jpg"
            alt="KESH Logo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (pathname?.startsWith("/auth")) {
    return children;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />

      <div className="md:pl-64">
        <Header />

        <main className="px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
