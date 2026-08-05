import { STATUS_COLORS, STATUS_LABELS } from "@/lib/status";
import type { DeviceStatus } from "@/types/device";

export default function StatusBadge({ status }: { status: DeviceStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <span
        className={`inline-block size-1.5 rounded-full ${
          status === "offline" ? "animate-pulse" : ""
        }`}
        style={{ backgroundColor: color }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
