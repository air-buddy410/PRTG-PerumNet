"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import MapFilters, {
  type AreaFilter,
  type GroupFilter,
} from "@/components/map/map-filters";
import { useDevices } from "@/hooks/use-devices";

// Leaflet accesses `window`, so the map can only render on the client.
const NetworkMap = dynamic(() => import("./network-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-background text-sm text-muted-foreground">
      Memuat peta…
    </div>
  ),
});

export default function MapView() {
  const { devices } = useDevices();
  const [area, setArea] = useState<AreaFilter>("all");
  const [group, setGroup] = useState<GroupFilter>("all");

  const areas = useMemo(
    () => [...new Set(devices.map((device) => device.area))].sort(),
    [devices],
  );

  const visibleDevices = useMemo(
    () =>
      devices.filter(
        (device) =>
          (area === "all" || device.area === area) &&
          (group === "all" || device.group === group),
      ),
    [devices, area, group],
  );

  const isFiltered = area !== "all" || group !== "all";

  return (
    <>
      <MapFilters
        area={area}
        group={group}
        areas={areas}
        onAreaChange={setArea}
        onGroupChange={setGroup}
        onReset={() => {
          setArea("all");
          setGroup("all");
        }}
      />
      {isFiltered && (
        <p className="absolute right-4 top-16 z-[1000] rounded-md border bg-card/90 px-2.5 py-1 text-xs text-muted-foreground shadow backdrop-blur">
          Menampilkan{" "}
          <span className="font-medium text-foreground">
            {visibleDevices.length}
          </span>{" "}
          dari {devices.length} perangkat
        </p>
      )}
      <NetworkMap devices={visibleDevices} filterKey={`${area}|${group}`} />
      <p className="noc-map-attribution" aria-label="Sumber data peta">
        © OpenStreetMap · © CARTO
      </p>
    </>
  );
}
