import { NextResponse } from "next/server";
import { getLatestDevices } from "@/server/device-store";
import type { DeviceStatus } from "@/types/device";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/summary
 * Ringkasan kesehatan jaringan untuk Big Numbers dasbor NOC.
 */
export async function GET() {
  const snapshot = await getLatestDevices();

  const counts = snapshot.devices.reduce(
    (acc, device) => {
      acc[device.status] += 1;
      return acc;
    },
    { online: 0, warning: 0, offline: 0 } as Record<DeviceStatus, number>,
  );

  return NextResponse.json(
    {
      total: snapshot.devices.length,
      online: counts.online,
      warning: counts.warning,
      offline: counts.offline,
      updatedAt: snapshot.updatedAt,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5",
      },
    },
  );
}
