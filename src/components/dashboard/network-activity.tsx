"use client";

import Link from "next/link";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronRight, MapPin } from "lucide-react";
import { useDevices } from "@/hooks/use-devices";
import StatusBadge from "@/components/status-badge";

export default function NetworkActivity() {
  const { devices } = useDevices();
  const incidents = devices
    .filter((device) => device.status !== "online")
    .slice(0, 4);

  return (
    <div className="noc-activity-grid">
      <section className="noc-panel noc-incidents-panel">
        <div className="noc-panel-heading">
          <div>
            <h2>Insiden terbaru</h2>
            <p>Perlu perhatian tim NOC</p>
          </div>
          <Link href="/notifications">Lihat semua <ChevronRight /></Link>
        </div>
        <div className="noc-incident-list">
          {incidents.length === 0 ? (
            <div className="noc-empty-state">Tidak ada insiden aktif saat ini.</div>
          ) : (
            incidents.map((device, index) => (
              <Link href={`/devices/${device.id}`} className="noc-incident-row" key={device.id}>
                <span className={`noc-severity-dot ${device.status}`} />
                <div>
                  <strong>{device.status === "offline" ? "Kritis" : "Perhatian"}</strong>
                  <span>{device.name}</span>
                </div>
                <small>{index === 0 ? "Baru saja" : `${index * 6 + 4} mnt lalu`}</small>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="noc-panel noc-traffic-panel">
        <div className="noc-panel-heading">
          <div>
            <h2>Trafik jaringan</h2>
            <p>Ringkasan 24 jam terakhir</p>
          </div>
          <button type="button">24 jam terakhir</button>
        </div>
        <div className="noc-traffic-values">
          <div><span><ArrowDown /> Download</span><strong>2,34 <small>Gbps</small></strong></div>
          <div><span><ArrowUp /> Upload</span><strong>1,12 <small>Gbps</small></strong></div>
        </div>
        <svg className="noc-sparkline" viewBox="0 0 470 142" role="img" aria-label="Grafik trafik jaringan">
          <path d="M5 93 C35 55 50 83 81 64 S120 92 146 72 S195 37 220 73 S270 99 294 61 S346 41 372 76 S424 94 465 45" fill="none" stroke="currentColor" strokeWidth="4" />
          <path d="M5 115 C31 95 56 121 81 101 S122 133 146 111 S191 86 220 117 S268 128 294 105 S342 98 372 112 S421 127 465 91" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 7" opacity=".45" />
        </svg>
        <div className="noc-chart-key"><span><i /> Download</span><span><i /> Upload</span></div>
      </section>

      <section className="noc-panel noc-site-panel">
        <div className="noc-panel-heading">
          <div>
            <h2>Site terpantau</h2>
            <p>Ringkasan sebaran jaringan</p>
          </div>
          <Link href="/map">Buka peta <ChevronRight /></Link>
        </div>
        <div className="noc-site-visual">
          <MapPin /><MapPin /><MapPin /><MapPin /><MapPin />
          <span className="site-line one" /><span className="site-line two" /><span className="site-line three" />
        </div>
        <div className="noc-site-summary">
          <span><i className="online" /> Normal</span>
          <span><i className="warning" /> Perhatian</span>
          <span><i className="offline" /> Offline</span>
        </div>
      </section>

      <section className="noc-panel noc-alert-strip">
        <AlertTriangle aria-hidden="true" />
        <div><strong>Gangguan terdeteksi di {new Set(incidents.map((device) => device.area)).size || 0} lokasi</strong><span>{incidents.length} perangkat membutuhkan pengecekan</span></div>
        {incidents[0] && <StatusBadge status={incidents[0].status} />}
      </section>
    </div>
  );
}
