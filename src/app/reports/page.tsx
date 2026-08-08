import type { Metadata } from "next";
import ReportsView from "@/components/reports/reports-view";

export const metadata: Metadata = {
  title: "Laporan Jaringan — PerumNet",
  description:
    "Laporan ketersediaan SLA dan penggunaan trafik dengan ekspor PDF/Excel.",
};

export default function ReportsPage() {
  return (
    <main className="noc-page">
      <div className="noc-page-intro"><div><h1>Laporan jaringan</h1><p>Ketersediaan SLA dan rekap penggunaan trafik per perangkat.</p></div></div>
      <ReportsView />
    </main>
  );
}
