// Layanan pembuatan berkas laporan di sisi server + audit ekspor
// (tabel sla_reports PRD). jsPDF berjalan isomorfik di Node.

import { randomUUID } from "node:crypto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { db } from "@/db";
import { slaReports } from "@/db/schema";
import { formatDowntime, formatVolume } from "@/lib/mock-reports";
import { getSlaReport, getTrafficReport } from "@/server/reports";

export type ReportKind = "sla" | "traffic";

interface ReportTable {
  title: string;
  head: string[];
  body: string[][];
}

function buildTable(kind: ReportKind, period: string): ReportTable {
  if (kind === "sla") {
    const report = getSlaReport(period);
    return {
      title: `Laporan Ketersediaan SLA — ${period}`,
      head: [
        "Perangkat",
        "Jenis",
        "Area",
        "Uptime (%)",
        "Downtime",
        "Insiden",
        "Status SLA",
      ],
      body: report.rows.map((row) => [
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
  const report = getTrafficReport(period);
  return {
    title: `Laporan Penggunaan Trafik — ${period}`,
    head: [
      "Perangkat",
      "Jenis",
      "Area",
      "Download",
      "Upload",
      "Rata-rata (Mbps)",
      "Puncak (Mbps)",
    ],
    body: report.rows.map((row) => [
      row.deviceName,
      row.group,
      row.area,
      formatVolume(row.downloadGb),
      formatVolume(row.uploadGb),
      String(row.avgMbps),
      String(row.peakMbps),
    ]),
  };
}

export function buildReportPdf(kind: ReportKind, period: string): Buffer {
  const { title, head, body } = buildTable(kind, period);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(13);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("PerumNet — Monitoring Jaringan", 14, 22);
  autoTable(doc, {
    head: [head],
    body,
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 40, 40] },
  });
  return Buffer.from(doc.output("arraybuffer"));
}

export function buildReportXlsx(kind: ReportKind, period: string): Buffer {
  const { title, head, body } = buildTable(kind, period);
  const sheet = XLSX.utils.aoa_to_sheet([[title], [], head, ...body]);
  sheet["!cols"] = head.map((label, index) => ({
    wch: Math.max(
      label.length,
      ...body.map((row) => row[index]?.length ?? 0),
    ) + 2,
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    sheet,
    kind === "sla" ? "SLA" : "Trafik",
  );
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

/** Catat audit ekspor laporan (riwayat bulanan sesuai PRD). */
export function recordExport(
  kind: ReportKind,
  formatType: "pdf" | "excel",
  period: string,
  userId?: string,
) {
  db.insert(slaReports)
    .values({
      id: randomUUID(),
      reportName: `laporan-${kind}-${period}`,
      reportType: kind,
      formatType,
      period,
      userId: userId ?? null,
    })
    .run();
}
