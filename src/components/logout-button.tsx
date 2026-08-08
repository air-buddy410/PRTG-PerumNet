"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/api/http";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await sendJson("POST", "/api/auth/sign-out", {}).catch(() => null);
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size={compact ? "icon-lg" : "sm"}
      onClick={handleLogout}
      aria-label={compact ? "Keluar" : undefined}
      className="text-[#d03b3b] hover:text-[#d03b3b]"
    >
      <LogOut data-icon="inline-start" />
      {compact ? <span className="sr-only">Keluar</span> : "Keluar"}
    </Button>
  );
}
