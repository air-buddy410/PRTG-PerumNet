"use client";

import Link from "next/link";
import useSWR from "swr";
import { CircleCheck, CircleDashed, MessageCircle, Send } from "lucide-react";
import { ApiError, getJson } from "@/lib/api/http";
import type { ChannelType, NotificationChannel } from "@/types/notification";

const CHANNEL_META: Record<
  ChannelType,
  { label: string; Icon: typeof Send; color: string }
> = {
  telegram: { label: "Telegram", Icon: Send, color: "#3987e5" },
  whatsapp: { label: "WhatsApp", Icon: MessageCircle, color: "#0ca30c" },
};

interface ChannelsResponse {
  channels: NotificationChannel[];
  total: number;
}

export default function ChannelList() {
  const { data, error } = useSWR(
    "/api/notifications/channels",
    getJson<ChannelsResponse>,
    { revalidateOnFocus: false },
  );
  const channels = data?.channels ?? [];

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">Channel Terdaftar</p>
        <p className="text-xs text-muted-foreground">
          {data ? `${data.total} channel` : "…"}
        </p>
      </div>
      {error instanceof ApiError && error.status === 401 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground hover:underline">
            Masuk
          </Link>{" "}
          untuk melihat channel notifikasi.
        </p>
      ) : !data ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Memuat channel…
        </p>
      ) : channels.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada channel terdaftar.
        </p>
      ) : (
        <ul className="divide-y">
          {channels.map((channel) => {
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
      )}
    </div>
  );
}
