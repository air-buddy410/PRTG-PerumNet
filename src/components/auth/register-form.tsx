"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, sendJson } from "@/lib/api/http";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await sendJson("POST", "/api/auth/sign-up/email", {
        name,
        email,
        password,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 422
          ? "Email tersebut sudah terdaftar."
          : err instanceof Error
            ? err.message
            : "Pendaftaran gagal.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CircleCheck className="size-10 text-[#0ca30c]" aria-hidden />
        <p className="text-sm font-medium">Pendaftaran berhasil</p>
        <p className="text-xs text-muted-foreground">
          Akun <span className="text-foreground">{email}</span> dibuat dengan
          peran <span className="text-foreground">Engineer</span>. Admin NOC
          dapat mengubah peran Anda di halaman Pengguna.
        </p>
        <Link
          href="/login"
          className={`${buttonVariants({ size: "sm" })} mt-2`}
        >
          Lanjut ke Halaman Masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="noc-login-form flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          required
          placeholder="mis. Budi Dharma"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="nama@perumnet.co.id"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Kata Sandi</Label>
        <Input
          id="password"
          type="password"
          required
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Konfirmasi Kata Sandi</Label>
        <Input
          id="confirm"
          type="password"
          required
          placeholder="Ulangi kata sandi"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </div>

      {error && <p className="text-xs text-[#d03b3b]">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-1">
        {submitting ? "Mendaftarkan…" : "Daftar"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
