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
    <div className="noc-device-list overflow-hidden">
      {error && (
        <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          Gagal menyinkronkan data perangkat — menampilkan data terakhir yang
          diketahui. Mencoba ulang otomatis…
        </p>
      )}
      {sorted.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          {isLoading ? "Memuat data perangkat…" : "Tidak ada perangkat."}
        </p>
      ) : (
        <>
          <div className="grid gap-2 p-2 md:hidden">
            {sorted.map((device) => (
              <Link
                key={device.id}
                href={`/devices/${device.id}`}
                className="rounded-lg border border-border bg-card px-3 py-3 transition-colors active:bg-secondary"
              >
                <div className="flex items-start justify-between gap-3">
                  <strong className="text-sm leading-5 text-foreground">
                    {device.name}
                  </strong>
                  <StatusBadge status={device.status} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{device.group}</span>
                  <span>{device.area}</span>
                  <span className="font-mono">{device.ip}</span>
                  <span className="text-right text-primary">Buka detail →</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
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
        </>
      )}
    </div>
  );
}
