"use client";

import { useState } from "react";
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
import { MOCK_USERS } from "@/lib/mock-users";
import { ROLE_LABELS, type UserRole } from "@/types/user";

const ROLES = Object.keys(ROLE_LABELS) as UserRole[];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UserTable() {
  // Stub: perubahan peran disimpan di state lokal — nantinya PATCH ke backend.
  const [users, setUsers] = useState(MOCK_USERS);

  function changeRole(userId: string, role: UserRole) {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, role } : user)),
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">Daftar Pengguna</p>
        <p className="text-xs text-muted-foreground">{users.length} pengguna</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Terdaftar</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-xs font-medium">{user.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) =>
                    changeRole(user.id, (value ?? user.role) as UserRole)
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="h-7 w-36 border bg-background text-xs"
                    aria-label={`Ubah peran ${user.name}`}
                  >
                    <SelectValue>{ROLE_LABELS[user.role]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(user.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                {user.status === "active" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0ca30c]">
                    <CircleCheck className="size-3.5" aria-hidden />
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#fab219]">
                    <CircleDashed className="size-3.5" aria-hidden />
                    Menunggu persetujuan
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
