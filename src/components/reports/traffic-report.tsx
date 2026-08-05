"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVolume, generateTrafficReport } from "@/lib/mock-reports";

export default function TrafficReport({ period }: { period: string }) {
  const rows = useMemo(() => generateTrafficReport(period), [period]);

  const totalDownload = rows.reduce((sum, row) => sum + row.downloadGB, 0);
  const totalUpload = rows.reduce((sum, row) => sum + row.uploadGB, 0);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm font-medium">Laporan Penggunaan Trafik</p>
        <p className="text-xs text-muted-foreground">
          Total download{" "}
          <span className="font-medium tabular-nums text-foreground">
            {formatVolume(totalDownload)}
          </span>{" "}
          · upload{" "}
          <span className="font-medium tabular-nums text-foreground">
            {formatVolume(totalUpload)}
          </span>
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
                {formatVolume(row.downloadGB)}
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                {formatVolume(row.uploadGB)}
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
