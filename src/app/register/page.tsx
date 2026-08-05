import type { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar Akun — PerumNet",
  description: "Buat akun PerumNet untuk mengakses dashboard monitoring NOC.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">PerumNet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar akun untuk mengakses monitoring NOC
          </p>
        </div>
        <div className="rounded-lg border bg-card px-6 py-6 shadow-lg">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
