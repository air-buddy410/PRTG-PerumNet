"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_USERS } from "@/lib/mock-users";
import { ROLE_LABELS } from "@/types/user";

// Stub: pengguna aktif = admin pertama; nantinya dari sesi Better Auth.
const CURRENT_USER = MOCK_USERS[0];

export default function ProfileForm() {
  const [name, setName] = useState(CURRENT_USER.name);
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Stub: nantinya PATCH profil ke backend.
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col rounded-lg border bg-card"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">Data Profil</p>
        <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium">
          {ROLE_LABELS[CURRENT_USER.role]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Nama Lengkap</Label>
          <Input
            id="profile-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="mt-auto flex items-center gap-3">
          <Button type="submit">Simpan Perubahan</Button>
          {saved && (
            <span className="flex items-center gap-1 text-xs font-medium text-[#0ca30c]">
              <CircleCheck className="size-3.5" aria-hidden />
              Profil tersimpan (tiruan)
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
