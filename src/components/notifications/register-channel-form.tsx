"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChannelType } from "@/types/notification";

const BOT_TARGET: Record<ChannelType, { label: string; contact: string }> = {
  telegram: { label: "Telegram", contact: "@PerumNetBot" },
  whatsapp: { label: "WhatsApp", contact: "+62 811-0000-1111" },
};

interface PendingRegistration {
  type: ChannelType;
  recipientName: string;
  target: string;
  code: string;
}

export default function RegisterChannelForm() {
  const [type, setType] = useState<ChannelType>("telegram");
  const [recipientName, setRecipientName] = useState("");
  const [target, setTarget] = useState("");
  const [pending, setPending] = useState<PendingRegistration | null>(null);

  const canSubmit = recipientName.trim() !== "" && target.trim() !== "";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    // Stub: kode verifikasi nantinya diterbitkan backend & dicocokkan bot.
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPending({ type, recipientName, target, code });
  }

  function resetForm() {
    setPending(null);
    setRecipientName("");
    setTarget("");
  }

  if (pending) {
    const bot = BOT_TARGET[pending.type];
    return (
      <div className="flex h-full flex-col rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">Verifikasi Channel</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Kirim kode berikut dari akun{" "}
            <span className="font-medium text-foreground">
              {pending.target}
            </span>{" "}
            ke bot {bot.label}{" "}
            <span className="font-mono text-foreground">{bot.contact}</span>:
          </p>
          <p className="rounded-lg border bg-background px-6 py-3 font-mono text-3xl font-bold tracking-[0.3em]">
            {pending.code}
          </p>
          <p className="text-xs text-muted-foreground">
            Channel “{pending.recipientName}” berstatus{" "}
            <span className="text-[#fab219]">menunggu verifikasi</span> sampai
            kode dikonfirmasi bot.
          </p>
          <Button variant="outline" size="sm" onClick={resetForm}>
            Daftarkan channel lain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col rounded-lg border bg-card"
    >
      <div className="border-b px-4 py-3">
        <p className="text-sm font-medium">Daftarkan Bot Baru</p>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <div className="flex rounded-md border p-0.5">
          {(["telegram", "whatsapp"] as ChannelType[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                option === type
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option === "telegram" ? (
                <Send className="size-3.5" aria-hidden />
              ) : (
                <MessageCircle className="size-3.5" aria-hidden />
              )}
              {BOT_TARGET[option].label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recipient-name">Nama Penerima</Label>
          <Input
            id="recipient-name"
            placeholder="mis. NOC Shift 2"
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="channel-target">
            {type === "telegram" ? "Username / ID Telegram" : "Nomor WhatsApp"}
          </Label>
          <Input
            id="channel-target"
            placeholder={
              type === "telegram" ? "mis. @budi_noc" : "mis. +62 812-XXXX-XXXX"
            }
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          />
        </div>

        <Button type="submit" disabled={!canSubmit} className="mt-auto">
          Daftarkan &amp; Minta Kode Verifikasi
        </Button>
      </div>
    </form>
  );
}
