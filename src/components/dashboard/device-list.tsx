"use client";

import Link from "next/link";
import StatusBadge from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDevices } from "@/hooks/use-devices";
import type { DeviceStatus, NetworkDevice } from "@/types/device";

// Perangkat bermasalah selalu tampil paling atas di wallboard NOC.
const STATUS_PRIORITY: Record<DeviceStatus, number> = {
  offline: 0,
  warning: 1,
  online: 2,
};

export default function DeviceList() {
  const { devices, isLoading, error } = useDevices();

  const sorted: NetworkDevice[] = [...devices].sort(
    (a, b) =>
      STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] ||
      a.name.localeCompare(b.name),
  );

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {error && (
        <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          Gagal menyinkronkan data perangkat — menampilkan data terakhir yang
          diketahui. Mencoba ulang otomatis…
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nama Perangkat</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                {isLoading ? "Memuat data perangkat…" : "Tidak ada perangkat."}
              </TableCell>
            </TableRow>
          )}
          {sorted.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/devices/${device.id}`}
                  className="hover:underline"
                >
                  {device.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {device.group}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {device.area}
              </TableCell>
              <TableCell className="font-mono text-xs">{device.ip}</TableCell>
              <TableCell className="text-right">
                <StatusBadge status={device.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
