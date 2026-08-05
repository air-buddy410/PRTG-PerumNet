"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportType } from "@/components/reports/reports-view";

interface ExportButtonsProps {
  reportType: ReportType;
  period: string;
  periodLabel: string;
}

// Unduh berkas dari endpoint ekspor server (butuh peran Admin/Manajemen).
async function downloadFromServer(url: string, fileName: string) {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Ekspor gagal (HTTP ${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export default function ExportButtons({
  reportType,
  period,
}: ExportButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"pdf" | "excel" | null>(null);

  async function handleExport(format: "pdf" | "excel") {
    setBusy(format);
    setError(null);
    const extension = format === "pdf" ? "pdf" : "xlsx";
    try {
      await downloadFromServer(
        `/api/reports/export/${format}?type=${reportType}&period=${period}`,
        `laporan-${reportType}-${period}.${extension}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ekspor gagal.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={() => handleExport("pdf")}
      >
        <FileText data-icon="inline-start" />
        {busy === "pdf" ? "Menyiapkan…" : "Ekspor PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={() => handleExport("excel")}
      >
        <FileSpreadsheet data-icon="inline-start" />
        {busy === "excel" ? "Menyiapkan…" : "Ekspor Excel"}
      </Button>
      {error && <p className="text-xs text-[#d03b3b]">{error}</p>}
    </div>
  );
}
