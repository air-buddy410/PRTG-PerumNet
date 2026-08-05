"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, sendJson } from "@/lib/api/http";

// Akun bootstrap bawaan (lihat src/server/bootstrap-admin.ts).
const DEMO_HINT = "admin@perumnet.co.id / perumnet123";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendJson("POST", "/api/auth/sign-in/email", { email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Email atau kata sandi salah. Periksa kembali kredensial Anda."
          : err instanceof Error
            ? err.message
            : "Gagal masuk.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && (
        <p className="flex items-start gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="mt-1">
        {loading ? "Memeriksa…" : "Masuk"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="text-foreground hover:underline">
          Daftar
        </Link>
      </p>
      <p className="rounded-md border border-dashed px-3 py-2 text-center text-[11px] text-muted-foreground">
        Demo: {DEMO_HINT}
      </p>
    </form>
  );
}
