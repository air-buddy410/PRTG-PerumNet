"use client";

import { useDevices } from "@/hooks/use-devices";
import { STATUS_COLORS } from "@/lib/status";

export default function LastUpdated() {
  const { updatedAt } = useDevices();

  if (!updatedAt) {
    return (
      <p className="text-[11px] text-muted-foreground">Menyinkronkan data…</p>
    );
  }

  const time = new Date(updatedAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <p className="text-[11px] text-muted-foreground">
      <span
        className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full align-middle"
        style={{ backgroundColor: STATUS_COLORS.online }}
      />
      Pembaruan terakhir: {time}
    </p>
  );
}
