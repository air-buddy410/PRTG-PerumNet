import { STATUS_COLORS, STATUS_LABELS } from "@/lib/status";
import type { NetworkDevice } from "@/types/device";

export default function DevicePopup({ device }: { device: NetworkDevice }) {
  return (
    <div className="min-w-44 space-y-1.5">
      <p className="text-sm font-semibold leading-tight">{device.name}</p>
      <p className="text-xs text-muted-foreground">
        {device.group} · {device.area}
      </p>
      <dl className="space-y-1 pt-0.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">IP Address</dt>
          <dd className="font-mono">{device.ip}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="flex items-center gap-1.5 font-medium">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[device.status] }}
            />
            {STATUS_LABELS[device.status]}
          </dd>
        </div>
      </dl>
    </div>
  );
}
