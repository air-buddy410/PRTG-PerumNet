"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    // Stub: nantinya memanggil API logout (Better Auth) & menghapus sesi.
    router.push("/login");
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
