import type { Metadata } from "next";
import LastUpdated from "@/components/last-updated";
import MapLegend from "@/components/map/map-legend";
import MapView from "@/components/map/map-view";

export const metadata: Metadata = {
  title: "Peta Sebaran Jaringan — PerumNet",
  description:
    "Peta GIS sebaran perangkat jaringan PerumNet dengan status real-time.",
};

export default function MapPage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <div className="absolute left-4 top-4 z-[1000] rounded-lg border bg-card/90 px-4 py-2 shadow-lg backdrop-blur">
        <h1 className="text-sm font-semibold">Peta Sebaran Jaringan</h1>
        <p className="text-xs text-muted-foreground">
          PerumNet — Monitoring ISP
        </p>
        <LastUpdated />
      </div>
      <MapLegend />
      <MapView />
    </main>
  );
}
