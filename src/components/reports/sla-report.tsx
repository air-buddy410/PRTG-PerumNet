"use client";

import useSWR from "swr";
import { CircleCheck, TriangleAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getJson } from "@/lib/api/http";
import { formatDowntime } from "@/lib/mock-reports";
import type { DeviceGroup } from "@/types/device";

interface SlaRow {
  deviceId: string;
  deviceName: string;
  group: DeviceGroup;
  area: string;
  uptimePercent: number;
  downtimeMinutes: number;
  incidents: number;
  meetsTarget: boolean;
}

interface SlaResponse {
  period: string;
  targetPercent: number;
  rows: SlaRow[];
  summary: { devices: number; averageUptime: number; belowTarget: number };
}

export default function SlaReport({ period }: { period: string }) {
  const { data } = useSWR(
    `/api/reports/sla?period=${period}`,
    getJson<SlaResponse>,
    { revalidateOnFocus: false },
  );
  const rows = data?.rows ?? [];

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm font-medium">
          Laporan Ketersediaan SLA{" "}
          <span className="text-xs font-normal text-muted-foreground">
            target ≥ {data?.targetPercent ?? 99.5}%
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {data ? (
            <>
              Rata-rata uptime{" "}
              <span className="font-medium tabular-nums text-foreground">
                {data.summary.averageUptime}%
              </span>{" "}
              · {data.summary.belowTarget} perangkat di bawah target
            </>
          ) : (
            "Memuat laporan…"
          )}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Perangkat</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Area</TableHead>
            <TableHead className="text-right">Uptime</TableHead>
            <TableHead className="text-right">Downtime</TableHead>
            <TableHead className="text-right">Insiden</TableHead>
            <TableHead className="text-right">Status SLA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.deviceId}>
              <TableCell className="text-xs font-medium">
                {row.deviceName}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {row.group}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {row.area}
              </TableCell>
              <TableCell
                className={`text-right text-xs font-semibold tabular-nums ${
                  row.meetsTarget ? "" : "text-[#d03b3b]"
                }`}
              >
                {row.uptimePercent.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                {formatDowntime(row.downtimeMinutes)}
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                {row.incidents}
              </TableCell>
              <TableCell className="text-right">
                {row.meetsTarget ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0ca30c]">
                    <CircleCheck className="size-3.5" aria-hidden />
                    Terpenuhi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#d03b3b]">
                    <TriangleAlert className="size-3.5" aria-hidden />
                    Di bawah target
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
