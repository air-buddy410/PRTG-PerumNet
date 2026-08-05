"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Laptop, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { ApiError, getJson, sendJson } from "@/lib/api/http";

interface AuthSession {
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  updatedAt: string;
  expiresAt: string;
}

function describeAgent(userAgent: string | null | undefined) {
  if (!userAgent) return { label: "Perangkat tidak dikenal", mobile: false };
  const mobile = /iphone|android|mobile/i.test(userAgent);
  const browser =
    /firefox/i.test(userAgent) ? "Firefox"
    : /edg/i.test(userAgent) ? "Edge"
    : /chrome|chromium/i.test(userAgent) ? "Chrome"
    : /safari/i.test(userAgent) ? "Safari"
    : "Browser";
  const os =
    /mac os/i.test(userAgent) ? "macOS"
    : /windows/i.test(userAgent) ? "Windows"
    : /iphone|ipad/i.test(userAgent) ? "iOS"
    : /android/i.test(userAgent) ? "Android"
    : /linux/i.test(userAgent) ? "Linux"
    : "OS lain";
  return { label: `${browser} · ${os}`, mobile };
}

export default function SessionList() {
  const { session } = useSession();
  const { data: sessions, error, mutate } = useSWR(
    "/api/auth/list-sessions",
    getJson<AuthSession[]>,
    { revalidateOnFocus: false },
  );
  const [busy, setBusy] = useState(false);

  const currentToken = session?.session.token;

  async function revoke(token: string) {
    setBusy(true);
    try {
      await sendJson("POST", "/api/auth/revoke-session", { token });
      await mutate();
    } finally {
      setBusy(false);
    }
  }

  async function revokeOthers() {
    setBusy(true);
    try {
      await sendJson("POST", "/api/auth/revoke-other-sessions", {});
      await mutate();
    } finally {
      setBusy(false);
    }
  }

  const rows = sessions ?? [];
  const hasOthers = rows.some((item) => item.token !== currentToken);

  return (
    <div className="rounded-lg border bg-card lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm font-medium">Sesi Login Aktif</p>
        <Button
          variant="outline"
          size="sm"
          onClick={revokeOthers}
          disabled={!hasOthers || busy}
        >
          Putuskan Semua Sesi Lain
        </Button>
      </div>
      {error instanceof ApiError && error.status === 401 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground hover:underline">
            Masuk
          </Link>{" "}
          untuk melihat sesi aktif.
        </p>
      ) : !sessions ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Memuat sesi…
        </p>
      ) : (
        <ul className="divide-y">
          {rows.map((item) => {
            const { label, mobile } = describeAgent(item.userAgent);
            const Icon = mobile ? Smartphone : Laptop;
            const isCurrent = item.token === currentToken;
            return (
              <li
                key={item.token}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full border text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {label}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-[#0ca30c]/15 px-2 py-0.5 text-[11px] font-medium text-[#0ca30c]">
                          Sesi ini
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.ipAddress ? (
                        <span className="font-mono">{item.ipAddress}</span>
                      ) : (
                        "IP tidak tercatat"
                      )}{" "}
                      · berlaku sampai{" "}
                      {new Date(item.expiresAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#d03b3b] hover:text-[#d03b3b]"
                    disabled={busy}
                    onClick={() => revoke(item.token)}
                  >
                    Putuskan
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
