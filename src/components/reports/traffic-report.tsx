"use client";

import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getJson } from "@/lib/api/http";
import { formatVolume } from "@/lib/mock-reports";
import type { DeviceGroup } from "@/types/device";

interface TrafficRow {
  deviceId: string;
  deviceName: string;
  group: DeviceGroup;
  area: string;
  downloadGb: number;
  uploadGb: number;
  avgMbps: number;
  peakMbps: number;
}

interface TrafficResponse {
  period: string;
  rows: TrafficRow[];
  summary: { devices: number; totalDownloadGb: number; totalUploadGb: number };
}

export default function TrafficReport({ period }: { period: string }) {
  const { data } = useSWR(
    `/api/reports/traffic?period=${period}`,
    getJson<TrafficResponse>,
    { revalidateOnFocus: false },
  );
  const rows = data?.rows ?? [];

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm font-medium">Laporan Penggunaan Trafik</p>
        <p className="text-xs text-muted-foreground">
          {data ? (
            <>
              Total download{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatVolume(data.summary.totalDownloadGb)}
              </span>{" "}
              · upload{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatVolume(data.summary.totalUploadGb)}
              </span>
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
            <TableHead className="text-right">Download</TableHead>
            <TableHead className="text-right">Upload</TableHead>
            <TableHead className="text-right">Rata-rata</TableHead>
            <TableHead className="text-right">Puncak</TableHead>
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
              <TableCell className="text-right text-xs font-semibold tabular-nums">
                {formatVolume(row.downloadGb)}
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                {formatVolume(row.uploadGb)}
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                {row.avgMbps} Mbps
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                {row.peakMbps} Mbps
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
