import DeviceList from "@/components/dashboard/device-list";

export default function DevicesPage() {
  return (
    <main className="noc-page">
      <div className="noc-page-intro">
        <div>
          <h1>Perangkat jaringan</h1>
          <p>Pantau status seluruh router, switch, OLT, uplink, dan server.</p>
        </div>
      </div>

      <section className="noc-device-section" aria-labelledby="device-directory-heading">
        <div className="noc-section-heading">
          <div>
            <h2 id="device-directory-heading">Daftar perangkat</h2>
            <p>Pilih perangkat untuk melihat detail monitoringnya.</p>
          </div>
        </div>
        <DeviceList />
      </section>
    </main>
  );
}
