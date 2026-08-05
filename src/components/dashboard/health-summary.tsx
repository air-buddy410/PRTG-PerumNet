"use client";

import { useDevices } from "@/hooks/use-devices";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/status";
import type { DeviceStatus } from "@/types/device";

export default function HealthSummary() {
  const { devices } = useDevices();
  const hasData = devices.length > 0;

  const counts = devices.reduce(
    (acc, device) => {
      acc[device.status] += 1;
      return acc;
    },
    { online: 0, warning: 0, offline: 0 } as Record<DeviceStatus, number>,
  );

  const cards: {
    label: string;
    value: number;
    color?: string;
    pulse?: boolean;
  }[] = [
    { label: "Total Perangkat", value: devices.length },
    {
      label: STATUS_LABELS.online,
      value: counts.online,
      color: STATUS_COLORS.online,
    },
    {
      label: STATUS_LABELS.warning,
      value: counts.warning,
      color: STATUS_COLORS.warning,
    },
    {
      label: STATUS_LABELS.offline,
      value: counts.offline,
      color: STATUS_COLORS.offline,
      pulse: counts.offline > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border bg-card px-5 py-4 shadow-sm"
        >
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {card.color && (
              <span
                className={`inline-block size-2.5 rounded-full ${
                  card.pulse ? "animate-pulse" : ""
                }`}
                style={{ backgroundColor: card.color }}
              />
            )}
            {card.label}
          </p>
          <p
            className="mt-2 text-4xl font-bold tabular-nums xl:text-5xl"
            style={card.color ? { color: card.color } : undefined}
          >
            {hasData ? card.value : "–"}
          </p>
        </div>
      ))}
    </div>
  );
}
