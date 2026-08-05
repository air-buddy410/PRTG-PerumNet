import type { Metadata } from "next";
import Link from "next/link";
import UserTable from "@/components/users/user-table";

export const metadata: Metadata = {
  title: "Manajemen Pengguna — PerumNet",
  description: "Daftar pengguna aplikasi beserta peran RBAC PerumNet.",
};

export default function UsersPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-xs text-muted-foreground">
            Kontrol akses berbasis peran (Admin NOC, NOC, Engineer, Manajemen)
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
        >
          ← Dasbor
        </Link>
      </header>

      <section className="flex-1 overflow-y-auto px-6 py-6">
        <UserTable />
      </section>
    </main>
  );
}
