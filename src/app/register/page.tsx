import type { Metadata } from "next";
import Image from "next/image";
import { UserRoundPlus } from "lucide-react";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar Akun • PerumNet NOC",
  description: "Buat akun PerumNet untuk mengakses dashboard monitoring NOC.",
};

export default function RegisterPage() {
  return (
    <main className="noc-login-page">
      <div className="noc-login-wrap">
        <div className="noc-login-brand">
          <div className="noc-logo-lockup">
            <Image src="/brand/perumnet-mark.png" alt="" width={56} height={56} priority className="noc-logo-mark" />
            <Image src="/brand/perumnet-wordmark.png" alt="PerumNet" width={188} height={25} priority className="noc-wordmark" />
          </div>
          <span>NOC &amp; OPERATIONS</span>
        </div>
        <section className="noc-login-card" aria-labelledby="noc-register-title">
          <div className="noc-login-icon" aria-hidden="true"><UserRoundPlus /></div>
          <h1 id="noc-register-title">Buat akun PerumNet NOC</h1>
          <p>Ajukan akses untuk tim operasional.</p>
          <RegisterForm />
        </section>
        <p className="noc-login-footer">© {new Date().getFullYear()} PerumNet — Internet Service Provider</p>
      </div>
    </main>
  );
}
