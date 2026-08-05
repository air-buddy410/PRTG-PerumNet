import type { Metadata } from "next";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import ChangePasswordForm from "@/components/profile/change-password-form";
import ProfileForm from "@/components/profile/profile-form";
import SessionList from "@/components/profile/session-list";

export const metadata: Metadata = {
  title: "Profil Saya — PerumNet",
  description: "Kelola data profil dan keamanan akun PerumNet Anda.",
};

export default function ProfilePage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Profil Saya</h1>
          <p className="text-xs text-muted-foreground">
            Kelola data pribadi dan keamanan akun
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            ← Dasbor
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="grid flex-1 content-start gap-4 overflow-y-auto px-6 py-6 lg:grid-cols-2">
        <ProfileForm />
        <ChangePasswordForm />
        <SessionList />
      </section>
    </main>
  );
}
