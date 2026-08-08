import type { Metadata } from "next";
import ChannelList from "@/components/notifications/channel-list";
import NotificationHistory from "@/components/notifications/notification-history";
import RegisterChannelForm from "@/components/notifications/register-channel-form";

export const metadata: Metadata = {
  title: "Notifikasi Cepat — PerumNet",
  description:
    "Pengaturan channel alert WhatsApp/Telegram dan riwayat notifikasi monitoring.",
};

export default function NotificationsPage() {
  return (
    <main className="noc-page">
      <div className="noc-page-intro"><div><h1>Notifikasi</h1><p>Atur distribusi alert jaringan ke WhatsApp dan Telegram.</p></div></div>
      <section className="grid content-start gap-5 lg:grid-cols-2">
        <ChannelList />
        <RegisterChannelForm />
        <div className="lg:col-span-2">
          <NotificationHistory />
        </div>
      </section>
    </main>
  );
}
