import type { Metadata } from "next";
import Link from "next/link";
import ReportsView from "@/components/reports/reports-view";

export const metadata: Metadata = {
  title: "Laporan Jaringan — PerumNet",
  description:
    "Laporan ketersediaan SLA dan penggunaan trafik dengan ekspor PDF/Excel.",
};

export default function ReportsPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Laporan Jaringan
          </h1>
          <p className="text-xs text-muted-foreground">
            Ketersediaan SLA &amp; rekap penggunaan trafik per perangkat
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
        >
          ← Dasbor
        </Link>
      </header>
      <ReportsView />
    </main>
  );
}
