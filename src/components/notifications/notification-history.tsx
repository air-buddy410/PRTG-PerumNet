"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ChevronDown,
  CircleCheck,
  CircleX,
  MessageCircle,
  NotebookPen,
  Search,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, getJson, sendJson } from "@/lib/api/http";
import type {
  ChannelType,
  NotificationLog,
  NotificationSendStatus,
} from "@/types/notification";

interface LogsResponse {
  logs: NotificationLog[];
  total: number;
}

type ChannelFilter = "all" | ChannelType;
type StatusFilter = "all" | NotificationSendStatus;

function FilterButtons<T extends string>({
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
          key={option.value}
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

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function NotificationHistory() {
  const { data, error, mutate } = useSWR(
    "/api/notifications/logs?limit=100",
    getJson<LogsResponse>,
    { revalidateOnFocus: false },
  );
  const allLogs = data?.logs ?? [];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLogs = allLogs.filter((log) => {
    if (channelFilter !== "all" && log.alertType !== channelFilter)
      return false;
    if (statusFilter !== "all" && log.status !== statusFilter) return false;
    if (normalizedQuery === "") return true;
    return (
      log.deviceName.toLowerCase().includes(normalizedQuery) ||
      log.messageContent.toLowerCase().includes(normalizedQuery)
    );
  });

  function toggleRow(id: string) {
    setExpandedId((current) => {
      const next = current === id ? null : id;
      if (next) {
        const log = allLogs.find((item) => item.id === next);
        setDraft(log?.resolutionNote ?? "");
      }
      return next;
    });
  }

  async function saveSolution(id: string) {
    setSaving(true);
    try {
      await sendJson("PATCH", `/api/notifications/logs/${id}`, {
        resolutionNote: draft.trim(),
      });
      await mutate();
    } finally {
      setSaving(false);
    }
  }

  if (error instanceof ApiError && error.status === 401) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">Riwayat Notifikasi</p>
        </div>
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground hover:underline">
            Masuk
          </Link>{" "}
          untuk melihat riwayat notifikasi.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-medium">Riwayat Notifikasi</p>
          <p className="text-xs text-muted-foreground">
            {filteredLogs.length} dari {allLogs.length} alert · klik baris
            untuk detail &amp; solusi
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari perangkat / pesan…"
              className="h-8 w-56 pl-8 text-xs"
              aria-label="Cari riwayat notifikasi"
            />
          </div>
          <FilterButtons<ChannelFilter>
            options={[
              { label: "Semua", value: "all" },
              { label: "Telegram", value: "telegram" },
              { label: "WhatsApp", value: "whatsapp" },
            ]}
            value={channelFilter}
            onChange={setChannelFilter}
          />
          <FilterButtons<StatusFilter>
            options={[
              { label: "Semua", value: "all" },
              { label: "Terkirim", value: "sent" },
              { label: "Gagal", value: "failed" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8" />
            <TableHead>Waktu</TableHead>
            <TableHead>Perangkat</TableHead>
            <TableHead>Pesan</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead className="text-right">Status Kirim</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada notifikasi yang cocok dengan pencarian/penyaring.
              </TableCell>
            </TableRow>
          )}
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const hasSolution = Boolean(log.resolutionNote);
            return (
              <Fragment key={log.id}>
                <TableRow
                  onClick={() => toggleRow(log.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatTime(log.triggeredAt)}
                  </TableCell>
                  <TableCell className="max-w-52 truncate text-xs">
                    {log.deviceName}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-xs">
                    {log.messageContent}
                    {hasSolution && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-[#0ca30c]">
                        <NotebookPen className="size-3" aria-hidden />
                        ada solusi
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {log.alertType === "telegram" ? (
                        <Send className="size-3.5 text-[#3987e5]" aria-hidden />
                      ) : (
                        <MessageCircle
                          className="size-3.5 text-[#0ca30c]"
                          aria-hidden
                        />
                      )}
                      {log.alertType === "telegram" ? "Telegram" : "WhatsApp"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {log.status === "sent" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0ca30c]">
                        <CircleCheck className="size-3.5" aria-hidden />
                        Terkirim
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#d03b3b]">
                        <CircleX className="size-3.5" aria-hidden />
                        Gagal
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="bg-background/40">
                      <div className="grid gap-4 px-2 py-3 lg:grid-cols-2">
                        <dl className="space-y-1.5 text-xs">
                          <div className="flex gap-2">
                            <dt className="w-28 text-muted-foreground">
                              Waktu lengkap
                            </dt>
                            <dd>{formatFullTime(log.triggeredAt)}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-28 text-muted-foreground">
                              Sensor PRTG
                            </dt>
                            <dd className="font-mono">{log.prtgSensorId}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-28 text-muted-foreground">
                              Pesan lengkap
                            </dt>
                            <dd className="flex-1">{log.messageContent}</dd>
                          </div>
                        </dl>
                        <div className="space-y-2">
                          <p className="text-xs font-medium">
                            Solusi / Tindak Lanjut
                          </p>
                          <Textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            placeholder="Tulis solusi atau tindak lanjut penanganan alert ini…"
                            className="min-h-20 text-xs"
                            onClick={(event) => event.stopPropagation()}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                saveSolution(log.id);
                              }}
                              disabled={draft.trim() === "" || saving}
                            >
                              {saving ? "Menyimpan…" : "Simpan Solusi"}
                            </Button>
                            {hasSolution && (
                              <span className="text-[11px] text-muted-foreground">
                                Tersimpan.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
