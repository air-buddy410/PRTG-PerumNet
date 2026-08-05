import { redirect } from "next/navigation";

// Sesuai user flow PRD: pengguna dipandu langsung ke wallboard Dasbor NOC.
export default function HomePage() {
  redirect("/dashboard");
}
