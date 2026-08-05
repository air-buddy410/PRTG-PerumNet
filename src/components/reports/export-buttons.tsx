"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import {
  formatDowntime,
  formatVolume,
  generateSlaReport,
  generateTrafficReport,
} from "@/lib/mock-reports";
import type { ReportType } from "@/components/reports/reports-view";

interface ExportButtonsProps {
  reportType: ReportType;
  period: string;
  periodLabel: string;
}

function buildTable(reportType: ReportType, period: string, periodLabel: string) {
  if (reportType === "sla") {
    return {
      title: `Laporan Ketersediaan SLA — ${periodLabel}`,
      head: [
        "Perangkat",
        "Jenis",
        "Area",
        "Uptime (%)",
        "Downtime",
        "Insiden",
        "Status SLA",
      ],
      body: generateSlaReport(period).map((row) => [
        row.deviceName,
        row.group,
        row.area,
        row.uptimePercent.toFixed(2),
        formatDowntime(row.downtimeMinutes),
        String(row.incidents),
        row.meetsTarget ? "Terpenuhi" : "Di bawah target",
      ]),
    };
  }
  return {
    title: `Laporan Penggunaan Trafik — ${periodLabel}`,
    head: [
      "Perangkat",
      "Jenis",
      "Area",
      "Download",
      "Upload",
      "Rata-rata (Mbps)",
      "Puncak (Mbps)",
    ],
    body: generateTrafficReport(period).map((row) => [
      row.deviceName,
      row.group,
      row.area,
      formatVolume(row.downloadGB),
      formatVolume(row.uploadGB),
      String(row.avgMbps),
      String(row.peakMbps),
    ]),
  };
}

function downloadBlob(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({
  reportType,
  period,
  periodLabel,
}: ExportButtonsProps) {
  const baseName = `laporan-${reportType}-${period}`;

  function exportCsv() {
    const { head, body } = buildTable(reportType, period, periodLabel);
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [head, ...body]
      .map((row) => row.map(escape).join(";"))
      .join("\r\n");
    // BOM agar Excel membaca UTF-8 dengan benar
    downloadBlob(`﻿${csv}`, `${baseName}.csv`, "text/csv;charset=utf-8");
  }

  function exportPdf() {
    const { title, head, body } = buildTable(reportType, period, periodLabel);
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(13);
    doc.text(title, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("PerumNet — Monitoring Jaringan (data tiruan)", 14, 22);
    autoTable(doc, {
      head: [head],
      body,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40] },
    });
    doc.save(`${baseName}.pdf`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportPdf}>
        <FileText data-icon="inline-start" />
        Ekspor PDF
      </Button>
      <Button variant="outline" size="sm" onClick={exportCsv}>
        <FileSpreadsheet data-icon="inline-start" />
        Ekspor Excel
      </Button>
    </div>
  );
}
