import { CircleCheck, CircleDashed, MessageCircle, Send } from "lucide-react";
import { MOCK_CHANNELS } from "@/lib/mock-notifications";
import type { ChannelType } from "@/types/notification";

const CHANNEL_META: Record<
  ChannelType,
  { label: string; Icon: typeof Send; color: string }
> = {
  telegram: { label: "Telegram", Icon: Send, color: "#3987e5" },
  whatsapp: { label: "WhatsApp", Icon: MessageCircle, color: "#0ca30c" },
};

export default function ChannelList() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">Channel Terdaftar</p>
        <p className="text-xs text-muted-foreground">
          {MOCK_CHANNELS.length} channel
        </p>
      </div>
      <ul className="divide-y">
        {MOCK_CHANNELS.map((channel) => {
          const { label, Icon, color } = CHANNEL_META[channel.type];
          return (
            <li
              key={channel.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex size-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}1f`, color }}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {channel.recipientName}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {label}
                    </span>
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {channel.target}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {channel.verified ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-[#0ca30c]">
                    <CircleCheck className="size-3.5" aria-hidden />
                    Terverifikasi
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-[#fab219]">
                    <CircleDashed className="size-3.5" aria-hidden />
                    Menunggu verifikasi
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {channel.active ? "Aktif menerima alert" : "Nonaktif"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
