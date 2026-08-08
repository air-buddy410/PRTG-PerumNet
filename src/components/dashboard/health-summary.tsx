"use client";

import { useDevices } from "@/hooks/use-devices";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/status";
import type { DeviceStatus } from "@/types/device";
import { Activity, CheckCircle2, Server, TriangleAlert } from "lucide-react";

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
    icon: typeof Server;
  }[] = [
    { label: "Total perangkat", value: devices.length, icon: Server },
    {
      label: STATUS_LABELS.online,
      value: counts.online,
      color: STATUS_COLORS.online,
      icon: CheckCircle2,
    },
    {
      label: STATUS_LABELS.warning,
      value: counts.warning,
      color: STATUS_COLORS.warning,
      icon: TriangleAlert,
    },
    {
      label: STATUS_LABELS.offline,
      value: counts.offline,
      color: STATUS_COLORS.offline,
      pulse: counts.offline > 0,
      icon: Activity,
    },
  ];

  return (
    <div className="noc-health-grid">
      {cards.map((card) => (
        <div
          key={card.label}
          className="noc-health-card"
        >
          <span className={`noc-health-icon ${card.pulse ? "is-pulsing" : ""}`} style={card.color ? { color: card.color } : undefined}><card.icon /></span>
          <div><p>{card.label}</p><strong style={card.color ? { color: card.color } : undefined}>{hasData ? card.value : "–"}</strong><small>{card.label === "Total perangkat" ? "Seluruh lokasi" : "Status terkini"}</small></div>
        </div>
      ))}
    </div>
  );
}
