"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { CircleCheck, CircleDashed } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, getJson, sendJson } from "@/lib/api/http";
import { ROLE_LABELS, type UserRole } from "@/types/user";

const ROLES = Object.keys(ROLE_LABELS) as UserRole[];

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  emailVerified: boolean;
  createdAt: string;
}

interface UsersResponse {
  users: UserRow[];
  total: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UserTable() {
  const { data, error, mutate } = useSWR("/api/users", getJson<UsersResponse>, {
    revalidateOnFocus: false,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  async function changeRole(userId: string, role: UserRole) {
    setActionError(null);
    try {
      await sendJson("PATCH", `/api/users/${userId}`, { role });
      await mutate();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal mengubah peran.",
      );
      await mutate();
    }
  }

  const users = data?.users ?? [];

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm font-medium">Daftar Pengguna</p>
        <div className="flex items-center gap-3">
          {actionError && (
            <p className="text-xs text-[#d03b3b]">{actionError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {data ? `${data.total} pengguna` : "…"}
          </p>
        </div>
      </div>

      {error instanceof ApiError ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          {error.status === 401 ? (
            <>
              <Link href="/login" className="text-foreground hover:underline">
                Masuk
              </Link>{" "}
              sebagai Admin NOC untuk mengelola pengguna.
            </>
          ) : (
            error.message
          )}
        </p>
      ) : !data ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Memuat pengguna…
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="text-right">Status Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((row) => {
              const role = (row.role ?? "engineer") as UserRole;
              return (
                <TableRow key={row.id}>
                  <TableCell className="text-xs font-medium">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={role}
                      onValueChange={(value) =>
                        changeRole(row.id, (value ?? role) as UserRole)
                      }
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-7 w-36 border bg-background text-xs"
                        aria-label={`Ubah peran ${row.name}`}
                      >
                        <SelectValue>{ROLE_LABELS[role]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {ROLE_LABELS[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0ca30c]">
                        <CircleCheck className="size-3.5" aria-hidden />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#fab219]">
                        <CircleDashed className="size-3.5" aria-hidden />
                        Belum verifikasi
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
