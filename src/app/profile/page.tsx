import type { Metadata } from "next";
import ChangePasswordForm from "@/components/profile/change-password-form";
import ProfileForm from "@/components/profile/profile-form";
import SessionList from "@/components/profile/session-list";

export const metadata: Metadata = {
  title: "Profil Saya • PerumNet NOC",
  description: "Kelola data profil dan keamanan akun PerumNet Anda.",
};

export default function ProfilePage() {
  return (
    <main className="noc-page">
      <div className="noc-page-intro"><div><h1>Profil saya</h1><p>Kelola data pribadi dan keamanan akun Anda.</p></div></div>
      <section className="grid content-start gap-5 lg:grid-cols-2">
        <ProfileForm />
        <ChangePasswordForm />
        <SessionList />
      </section>
    </main>
  );
}
