import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export function MainLayout({ children }: { children: React.ReactNode }) {
  // Authentication is handled at the server level by proxy.ts (middleware)
  // This component now acts as a pure structural layout.

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
