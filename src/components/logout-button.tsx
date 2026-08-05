"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/api/http";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await sendJson("POST", "/api/auth/sign-out", {}).catch(() => null);
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="text-[#d03b3b] hover:text-[#d03b3b]"
    >
      <LogOut data-icon="inline-start" />
      Keluar
    </Button>
  );
}
