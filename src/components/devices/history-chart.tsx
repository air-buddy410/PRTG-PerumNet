"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_GRID_DARK,
  CHART_INK_MUTED,
  CHART_SLOT_1,
} from "@/lib/chart-colors";
import {
  generateHistorySeries,
  type HistoryMetric,
} from "@/lib/mock-metrics";

const METRICS: { key: HistoryMetric; label: string; unit: string }[] = [
  { key: "cpu", label: "CPU", unit: "%" },
  { key: "ram", label: "RAM", unit: "%" },
  { key: "suhu", label: "Suhu", unit: "°C" },
  { key: "bandwidth", label: "Bandwidth", unit: " Mbps" },
];

const RANGES: { label: string; hours: number }[] = [
  { label: "1 Jam", hours: 1 },
  { label: "6 Jam", hours: 6 },
  { label: "24 Jam", hours: 24 },
  { label: "7 Hari", hours: 168 },
];

function SegmentedButtons<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-md border p-0.5">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            option.value === value
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function HistoryChart({ deviceId }: { deviceId: string }) {
  const [metric, setMetric] = useState<HistoryMetric>("cpu");
  const [hours, setHours] = useState(24);

  const meta = METRICS.find((item) => item.key === metric)!;
  const data = useMemo(
    () => generateHistorySeries(deviceId, metric, hours),
    [deviceId, metric, hours],
  );

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <p className="text-sm font-medium">Grafik Riwayat — {meta.label}</p>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedButtons
            options={METRICS.map((item) => ({
              label: item.label,
              value: item.key,
            }))}
            value={metric}
            onChange={setMetric}
          />
          <SegmentedButtons
            options={RANGES.map((item) => ({
              label: item.label,
              value: item.hours,
            }))}
            value={hours}
            onChange={setHours}
          />
        </div>
      </div>
      <div className="h-72 px-2 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 0, left: -8 }}
          >
            <CartesianGrid stroke={CHART_GRID_DARK} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: CHART_INK_MUTED, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={56}
            />
            <YAxis
              tick={{ fill: CHART_INK_MUTED, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={
                metric === "cpu" || metric === "ram" ? [0, 100] : ["auto", "auto"]
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              formatter={(value) => [`${value}${meta.unit}`, meta.label]}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={meta.label}
              stroke={CHART_SLOT_1}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
