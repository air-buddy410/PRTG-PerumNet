import type { Metadata } from "next";
import Link from "next/link";
import ChannelList from "@/components/notifications/channel-list";
import NotificationHistory from "@/components/notifications/notification-history";
import RegisterChannelForm from "@/components/notifications/register-channel-form";

export const metadata: Metadata = {
  title: "Notifikasi Cepat — PerumNet",
  description:
    "Pengaturan channel alert WhatsApp/Telegram dan riwayat notifikasi PRTG.",
};

export default function NotificationsPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Notifikasi Cepat
          </h1>
          <p className="text-xs text-muted-foreground">
            Distribusi alert PRTG ke WhatsApp &amp; Telegram
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
        >
          ← Dasbor
        </Link>
      </header>

      <section className="grid flex-1 content-start gap-4 overflow-y-auto px-6 py-6 lg:grid-cols-2">
        <ChannelList />
        <RegisterChannelForm />
        <div className="lg:col-span-2">
          <NotificationHistory />
        </div>
      </section>
    </main>
  );
}
