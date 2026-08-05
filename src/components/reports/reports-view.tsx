"use client";

import { useState } from "react";
import { ChartNoAxesColumn, ShieldCheck } from "lucide-react";
import ExportButtons from "@/components/reports/export-buttons";
import SlaReport from "@/components/reports/sla-report";
import TrafficReport from "@/components/reports/traffic-report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ReportType = "sla" | "traffic";

export interface ReportPeriod {
  value: string; // "2026-08"
  label: string; // "Agustus 2026"
}

// 6 bulan terakhir sebagai pilihan periode laporan.
export const REPORT_PERIODS: ReportPeriod[] = [
  { value: "2026-08", label: "Agustus 2026" },
  { value: "2026-07", label: "Juli 2026" },
  { value: "2026-06", label: "Juni 2026" },
  { value: "2026-05", label: "Mei 2026" },
  { value: "2026-04", label: "April 2026" },
  { value: "2026-03", label: "Maret 2026" },
];

const REPORT_TYPES: {
  key: ReportType;
  label: string;
  Icon: typeof ShieldCheck;
}[] = [
  { key: "sla", label: "Ketersediaan SLA", Icon: ShieldCheck },
  { key: "traffic", label: "Penggunaan Trafik", Icon: ChartNoAxesColumn },
];

export default function ReportsView() {
  const [reportType, setReportType] = useState<ReportType>("sla");
  const [period, setPeriod] = useState(REPORT_PERIODS[1].value);

  const periodLabel =
    REPORT_PERIODS.find((item) => item.value === period)?.label ?? period;

  return (
    <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border p-0.5">
          {REPORT_TYPES.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setReportType(key)}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                key === reportType
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value ?? period)}
          >
            <SelectTrigger
              size="sm"
              className="w-44 border bg-card"
              aria-label="Pilih periode laporan"
            >
              <SelectValue>{periodLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {REPORT_PERIODS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportButtons
            reportType={reportType}
            period={period}
            periodLabel={periodLabel}
          />
        </div>
      </div>

      {reportType === "sla" ? (
        <SlaReport period={period} />
      ) : (
        <TrafficReport period={period} />
      )}
    </section>
  );
}
