import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk — PerumNet",
  description: "Masuk ke dashboard monitoring jaringan PerumNet.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">PerumNet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masuk ke dashboard monitoring NOC
          </p>
        </div>
        <div className="rounded-lg border bg-card px-6 py-6 shadow-lg">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
