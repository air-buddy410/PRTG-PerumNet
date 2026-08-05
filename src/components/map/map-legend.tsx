"use client";

import { useDevices } from "@/hooks/use-devices";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/status";
import type { DeviceStatus } from "@/types/device";

const STATUS_ORDER: DeviceStatus[] = ["online", "warning", "offline"];

export default function MapLegend() {
  const { devices } = useDevices();

  const counts = devices.reduce(
    (acc, device) => {
      acc[device.status] += 1;
      return acc;
    },
    { online: 0, warning: 0, offline: 0 } as Record<DeviceStatus, number>,
  );

  return (
    <div className="absolute bottom-16 left-4 z-[1000] w-44 rounded-lg border bg-card/90 px-3 py-2 shadow-lg backdrop-blur">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Status Perangkat
      </p>
      <ul className="space-y-1">
        {STATUS_ORDER.map((status) => (
          <li
            key={status}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              {STATUS_LABELS[status]}
            </span>
            <span className="font-medium tabular-nums">
              {devices.length > 0 ? counts[status] : "–"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
