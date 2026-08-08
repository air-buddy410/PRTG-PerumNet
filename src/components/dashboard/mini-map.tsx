"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useDevices } from "@/hooks/use-devices";

// Leaflet accesses `window`, so the map can only render on the client.
const NetworkMap = dynamic(() => import("@/components/map/network-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-background text-sm text-muted-foreground">
      Memuat peta…
    </div>
  ),
});

export default function MiniMap() {
  const { devices } = useDevices();

  return (
    <div className="noc-panel flex h-full min-h-80 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">Peta Sebaran Jaringan</p>
        <Link
          href="/map"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Buka peta penuh →
        </Link>
      </div>
      <div className="flex-1">
        <NetworkMap devices={devices} filterKey="all|all" />
      </div>
    </div>
  );
}
