"use client";

import { useState } from "react";
import { Laptop, Smartphone, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginSession {
  id: string;
  device: string;
  kind: "desktop" | "mobile" | "wallboard";
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// Data tiruan sesi login — nantinya dari tabel sessions (Better Auth).
const MOCK_SESSIONS: LoginSession[] = [
  {
    id: "sess-01",
    device: "Chrome · macOS",
    kind: "desktop",
    ip: "10.10.1.25",
    location: "Kantor NOC, Jakarta",
    lastActive: "Aktif sekarang",
    isCurrent: true,
  },
  {
    id: "sess-02",
    device: "TV Wallboard · Chromium Kiosk",
    kind: "wallboard",
    ip: "10.10.1.60",
    location: "Ruang Kontrol NOC",
    lastActive: "Aktif sekarang",
    isCurrent: false,
  },
  {
    id: "sess-03",
    device: "Safari · iPhone",
    kind: "mobile",
    ip: "182.253.44.101",
    location: "Jakarta Selatan",
    lastActive: "2 jam lalu",
    isCurrent: false,
  },
  {
    id: "sess-04",
    device: "Firefox · Windows",
    kind: "desktop",
    ip: "36.68.12.7",
    location: "Bekasi",
    lastActive: "Kemarin, 21.14",
    isCurrent: false,
  },
];

const KIND_ICON = { desktop: Laptop, mobile: Smartphone, wallboard: Tv };

export default function SessionList() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  function revoke(id: string) {
    // Stub: nantinya DELETE sesi ke backend.
    setSessions((current) => current.filter((session) => session.id !== id));
  }

  function revokeOthers() {
    setSessions((current) => current.filter((session) => session.isCurrent));
  }

  const hasOthers = sessions.some((session) => !session.isCurrent);

  return (
    <div className="rounded-lg border bg-card lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm font-medium">Sesi Login Aktif</p>
        <Button
          variant="outline"
          size="sm"
          onClick={revokeOthers}
          disabled={!hasOthers}
        >
          Putuskan Semua Sesi Lain
        </Button>
      </div>
      <ul className="divide-y">
        {sessions.map((session) => {
          const Icon = KIND_ICON[session.kind];
          return (
            <li
              key={session.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full border text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {session.device}
                    {session.isCurrent && (
                      <span className="ml-2 rounded-full bg-[#0ca30c]/15 px-2 py-0.5 text-[11px] font-medium text-[#0ca30c]">
                        Sesi ini
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{session.ip}</span> ·{" "}
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#d03b3b] hover:text-[#d03b3b]"
                  onClick={() => revoke(session.id)}
                >
                  Putuskan
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
