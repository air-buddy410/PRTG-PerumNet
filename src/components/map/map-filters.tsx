"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DeviceGroup } from "@/types/device";

export type AreaFilter = string; // "all" atau nama area
export type GroupFilter = "all" | DeviceGroup;

const DEVICE_GROUPS: DeviceGroup[] = ["MikroTik", "Ruijie", "OLT"];

interface MapFiltersProps {
  area: AreaFilter;
  group: GroupFilter;
  areas: string[];
  onAreaChange: (area: AreaFilter) => void;
  onGroupChange: (group: GroupFilter) => void;
  onReset: () => void;
}

export default function MapFilters({
  area,
  group,
  areas,
  onAreaChange,
  onGroupChange,
  onReset,
}: MapFiltersProps) {
  const isFiltered = area !== "all" || group !== "all";

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2 sm:flex-row">
      <Select
        value={area}
        onValueChange={(value) => onAreaChange(value ?? "all")}
      >
        <SelectTrigger
          size="sm"
          className="w-44 border bg-card/90 shadow-lg backdrop-blur"
          aria-label="Filter area"
        >
          <SelectValue placeholder="Semua Area">
            {area === "all" ? "Semua Area" : area}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-[1100]">
          <SelectItem value="all">Semua Area</SelectItem>
          {areas.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={group}
        onValueChange={(value) => onGroupChange((value as GroupFilter) ?? "all")}
      >
        <SelectTrigger
          size="sm"
          className="w-44 border bg-card/90 shadow-lg backdrop-blur"
          aria-label="Filter jenis perangkat"
        >
          <SelectValue placeholder="Semua Jenis">
            {group === "all"
              ? "Semua Jenis"
              : group === "OLT"
                ? "OLT (ZTE)"
                : group}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-[1100]">
          <SelectItem value="all">Semua Jenis</SelectItem>
          {DEVICE_GROUPS.map((name) => (
            <SelectItem key={name} value={name}>
              {name === "OLT" ? "OLT (ZTE)" : name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltered && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="bg-card/90 shadow-lg backdrop-blur"
        >
          <X data-icon="inline-start" />
          Reset Filter
        </Button>
      )}
    </div>
  );
}
