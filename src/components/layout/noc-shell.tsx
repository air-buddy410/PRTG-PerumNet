"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Bell,
  BarChart3,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Map,
  Menu,
  Search,
  Users,
  Wifi,
  X,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";

const navigation = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
  { href: "/devices", label: "Perangkat", icon: Wifi },
  { href: "/map", label: "Peta Jaringan", icon: Map },
  { href: "/notifications", label: "Notifikasi", icon: Bell },
  { href: "/reports", label: "Laporan", icon: ClipboardList },
  { href: "/users", label: "Pengguna", icon: Users },
];

const pageNames: Record<string, string> = {
  "/dashboard": "Dasbor",
  "/devices": "Perangkat",
  "/map": "Peta Jaringan",
  "/notifications": "Notifikasi",
  "/reports": "Laporan",
  "/users": "Pengguna",
  "/profile": "Profil",
};

function currentPage(pathname: string) {
  if (pathname.startsWith("/devices/")) return "Perangkat";
  return pageNames[pathname] ?? "Dasbor";
}

export default function NocShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPublicPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  if (isPublicPage) return <>{children}</>;

  const title = currentPage(pathname);

  function toggleMenu() {
    setMenuOpen((value) => !value);
  }

  return (
    <div className="noc-shell">
      {menuOpen && (
        <button
          className="noc-sidebar-backdrop"
          aria-label="Tutup menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside id="noc-sidebar" className={`noc-sidebar ${menuOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="noc-sidebar-close"
          aria-label="Tutup menu"
          onClick={() => setMenuOpen(false)}
        >
          <X aria-hidden="true" />
        </button>
        <div className="noc-brand">
          <Image
            src="/brand/perumnet-logo.png"
            alt="PerumNet"
            width={106}
            height={148}
            priority
            className="noc-brand-logo"
          />
          <span>Network Operations Center</span>
        </div>
        <div className="noc-sidebar-rule" />
        <nav className="noc-navigation" aria-label="Navigasi utama">
          {navigation.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href === "/devices" && pathname.startsWith("/devices/"));
            return (
              <Link
                key={label}
                href={href}
                className={`noc-nav-link ${isActive ? "is-active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
                {label === "Notifikasi" && <b>12</b>}
              </Link>
            );
          })}
        </nav>
        <div className="noc-sidebar-footer">
          <div className="noc-avatar">AD</div>
          <div>
            <strong>Admin NOC</strong>
            <span>noc@perumnet.id</span>
          </div>
          <Link href="/profile" aria-label="Buka profil" onClick={() => setMenuOpen(false)}>
            <ChevronRight aria-hidden="true" />
          </Link>
        </div>
      </aside>

      <div className="noc-workspace">
        <header className="noc-topbar">
          <button
            type="button"
            className="noc-menu-button"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-controls="noc-sidebar"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <div className="noc-breadcrumb">
            <span>Operasional</span>
            <i>/</i>
            <strong>{title}</strong>
          </div>
          <label className="noc-search">
            <Search aria-hidden="true" />
            <input placeholder="Cari perangkat, lokasi, IP, atau ID" />
          </label>
          <div className="noc-topbar-status">
            <span />
            Live
          </div>
          <div className="noc-topbar-actions">
            <Link href="/notifications" aria-label="Notifikasi">
              <Bell aria-hidden="true" />
              <b>12</b>
            </Link>
            <Link href="/reports" aria-label="Laporan">
              <BarChart3 aria-hidden="true" />
            </Link>
            <LogoutButton compact />
          </div>
        </header>
        <div className="noc-content">{children}</div>
      </div>
    </div>
  );
}
