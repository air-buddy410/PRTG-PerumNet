import type { Metadata } from "next";
import Link from "next/link";
import DeviceList from "@/components/dashboard/device-list";
import HealthSummary from "@/components/dashboard/health-summary";
import MiniMap from "@/components/dashboard/mini-map";
import LastUpdated from "@/components/last-updated";
import LogoutButton from "@/components/logout-button";

export const metadata: Metadata = {
  title: "Dasbor NOC — PerumNet",
  description:
    "Wallboard NOC PerumNet: ringkasan kesehatan jaringan real-time untuk layar besar ruang kontrol.",
};

export default function DashboardPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      {/* Bagian 1 — Header wallboard */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Dasbor NOC</h1>
          <p className="text-xs text-muted-foreground">
            PerumNet — Monitoring Jaringan Real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LastUpdated />
          <Link
            href="/map"
            className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Peta Sebaran
          </Link>
          <Link
            href="/notifications"
            className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Notifikasi
          </Link>
          <Link
            href="/reports"
            className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Laporan
          </Link>
          <Link
            href="/users"
            className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Pengguna
          </Link>
          <Link
            href="/profile"
            className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Profil
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Bagian 2 — Ringkasan kesehatan jaringan (Big Numbers) */}
      <section
        aria-label="Ringkasan kesehatan jaringan"
        className="border-b px-6 py-6"
      >
        <HealthSummary />
      </section>

      {/* Bagian 3 — Konten pemantauan utama */}
      <section
        aria-label="Panel pemantauan"
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DeviceList />
          </div>
          <div className="lg:col-span-2">
            <MiniMap />
          </div>
        </div>
      </section>
    </main>
  );
}
