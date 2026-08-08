# Prompt Claude — Implementasi PerumNet NOC Monitoring Portal

Implementasikan refactor penuh project ini menjadi **PerumNet NOC Monitoring Portal berbasis LibreNMS**.

## Aturan kerja

Sebelum mengubah kode:

1. Pelajari seluruh struktur project, stack, schema database, API route, komponen, auth/RBAC, dan data mock yang sekarang masih menggunakan PRTG.
2. Jangan menghapus data atau fitur valid tanpa migrasi yang aman.
3. Jangan deploy, push Git, atau mengubah server Proxmox tanpa instruksi dan akses eksplisit.
4. Jangan gunakan token/kredensial asli di source code, log, frontend, atau commit.

## Tujuan

- LibreNMS menjadi source of truth untuk discovery perangkat, SNMP polling, status, alert, availability, port/interface, health sensor, grafik, dan trafik.
- Aplikasi ini menjadi NOC Portal untuk NOC, engineer, manajemen, customer, dan integrasi CRM PerumNet.
- Portal menyediakan visualisasi topologi jaringan ala NOC: topologi dapat dibuat manual maupun dibentuk dari rekomendasi discovery LibreNMS, dengan penanda merek, jenis, role, dan nama perangkat.
- Ganti seluruh istilah, ID, endpoint, mock data, webhook, dan komentar terkait PRTG menjadi LibreNMS.
- Jangan menyimpan raw telemetry LibreNMS di portal. Portal hanya menyimpan data aplikasi: user, role, metadata asset tambahan, mapping CRM, audit log, cache, incident, dan konfigurasi notifikasi.

## Arsitektur target

- Buat adapter server-side LibreNMS API. Token LibreNMS hanya boleh tersedia di backend melalui environment variable.
- Gunakan endpoint LibreNMS untuk device, port, health, alert, availability, event log, dan graph.
- Ganti ID perangkat lama menjadi `assetId` internal dengan relasi ke `librenmsDeviceId`.
- Data asset minimal: hostname, display name, management IP, vendor, OS, model, serial number, site, lokasi, koordinat, tag, role jaringan, status, dan referensi CRM opsional.
- Role jaringan: `core`, `distribution`, `access`, `olt`, `server`, `infrastructure`.
- Topology engine Portal menyimpan layout, relasi yang dikonfirmasi, metadata link, dan versi diagram; raw telemetry maupun kredensial perangkat tetap berada di LibreNMS/perangkat.
- Discovery topologi hanya menggunakan data yang tersedia dari LibreNMS, seperti relasi perangkat dan data neighbor LLDP/CDP/FDB bila didukung perangkat. Jangan menjanjikan auto-detect sempurna untuk perangkat, MIB, atau data neighbor yang tidak tersedia.
- Hasil auto-discovery adalah **rekomendasi** berprovenance dan confidence, bukan perubahan otomatis pada topologi yang sudah dipublikasikan. Admin/Engineer wajib meninjau dan mengonfirmasi perubahan sebelum dipublikasikan.
- Siapkan cache Redis dengan fallback development yang aman.
- Semua endpoint API portal berada di `/api/v1`.

## API wajib

- `GET /api/v1/overview`
- `GET /api/v1/assets`
- `GET /api/v1/assets/:assetId`
- `GET /api/v1/incidents`
- `POST /api/v1/incidents/:alertId/acknowledge`
- `GET /api/v1/customer/services/:serviceId/status`
- `POST /api/v1/integrations/crm/service-mappings`
- `POST /api/v1/integrations/librenms/alerts`
- `GET /api/v1/topologies`
- `POST /api/v1/topologies`
- `GET /api/v1/topologies/:topologyId`
- `PATCH /api/v1/topologies/:topologyId`
- `POST /api/v1/topologies/:topologyId/discovery`
- `POST /api/v1/topologies/:topologyId/publish`

## RBAC

- `admin`: konfigurasi integrasi, user, role, mapping CRM, notifikasi, audit.
- `noc`: dashboard, alert, acknowledge, incident, peta, laporan.
- `engineer`: seluruh akses NOC ditambah detail perangkat dan maintenance.
- `manajemen`: dashboard ringkasan dan laporan tanpa aksi teknis.
- `customer`: hanya status layanan sendiri.
- Hanya `admin`, `noc`, dan `engineer` yang dapat melihat topologi internal. Hanya `admin` dan `engineer` yang dapat membuat, mengubah, mengonfirmasi discovery, atau mempublikasikan topologi. `manajemen` hanya membaca ringkasan topologi bila disetujui; `customer` tidak pernah melihat topologi internal.

## Topologi jaringan

- Sediakan halaman topologi jaringan responsif dengan mode **Lihat**, **Edit manual**, dan **Review discovery**.
- Topologi manual memungkinkan user berwenang menambahkan node asset, memilih asset yang sudah dipetakan ke `assetId`, menetapkan posisi, membuat link, mengubah label, dan menghapus relasi dengan audit log.
- Link minimal memiliki sumber, tujuan, port/interface opsional, media/link type, kapasitas opsional, arah, status, dan catatan. Link tidak boleh menyimpan community string, token, atau kredensial.
- Node menampilkan nama perangkat, hostname, vendor/merek, OS, model, role jaringan, status terkini, site, dan indikator alert. Style/icon harus dipilih dari metadata vendor + role/jenis perangkat; hostname hanya menjadi label, bukan satu-satunya sumber klasifikasi.
- Klasifikasi awal vendor/jenis perangkat dapat berasal dari data LibreNMS (`manufacturer`, `os`, `hardware`, `type`, `sysName`) dengan override manual yang diaudit untuk data yang belum lengkap.
- Discovery menggunakan relasi/neighbor yang tersedia dari LibreNMS dan menghasilkan daftar usulan node/link beserta sumber data, waktu discovery, dan confidence. User dapat menerima, menolak, atau menggabungkan usulan secara satu per satu maupun batch.
- Jangan menghapus atau menggeser node/link manual ketika discovery dijalankan. Gunakan versi/draft dan publish agar diagram operasional stabil.
- Topologi harus mendukung filter site, vendor, role, status, tag, dan kata kunci; drill-down perangkat; zoom/pan; minimap atau fit-to-screen; serta empty/loading/error state yang jelas.
- Desktop menyediakan canvas lengkap dan panel properti; tablet memakai panel collapsible; mobile memakai mode lihat yang nyaman, bottom sheet/filter sheet, serta editor sederhana tanpa overflow atau target sentuh kecil.
- Jangan menggunakan data topologi simulasi pada produksi. Development fixture harus jelas diberi label dan tidak boleh tercampur dengan data operasional.

## CRM eksternal

- CRM PerumNet **tidak dibangun, tidak di-host, dan tidak menjadi modul UI** di repository Portal ini.
- Portal hanya menyimpan mapping integrasi minimal yang diperlukan: external `customerId`, external `serviceId`, `assetId`/group LibreNMS, status sinkronisasi, dan audit log.
- Jangan membuat halaman CRM, model pelanggan lengkap, billing, ticketing, inventori CRM, atau mengubah data pelanggan/tiket/tagihan CRM di project ini.
- Integrasi dilakukan melalui API Portal v1, webhook incident/recovery outbound yang terautentikasi, serta deep link yang dikonfigurasi. Contract, payload, retry, idempotency, dan error log harus didokumentasikan.
- Jangan memanggil atau memutasi CRM nyata tanpa endpoint, skema otorisasi, secret, dan persetujuan eksplisit. Bila belum tersedia, implementasikan interface/adapter dan fixture kontrak yang aman saja.

## Portal pelanggan

- Customer hanya dapat melihat layanan miliknya berdasarkan external `customerId` dan `serviceId` yang sudah dipetakan oleh CRM eksternal.
- Tampilkan status layanan, gangguan aktif, maintenance, riwayat incident terkait, dan kontak bantuan.
- Jangan tampilkan IP manajemen, topologi internal, nama perangkat internal, raw graph, atau data customer lain.
- Belum perlu menampilkan penggunaan/billing pelanggan.

## Alert

- Buat secure webhook ingress dari LibreNMS dengan secret header environment variable.
- Alert dan recovery harus idempoten agar alert yang sama tidak membuat incident ganda.
- Simpan severity, device, waktu, status, acknowledgement, resolution note, dan audit log.
- Pertahankan integrasi Telegram/WhatsApp yang sudah ada, tetapi hilangkan mode simulasi untuk production dan pastikan error tercatat aman.

## UI dan responsivitas

- Pertahankan fitur dashboard, daftar perangkat, detail perangkat, peta, notifikasi, laporan, profile, dan user management yang sudah ada.
- Refactor agar responsive:
  - desktop: tabel/peta/dashboard multi-kolom;
  - tablet: grid adaptif dan filter collapsible;
  - mobile: kartu ringkas, tombol mudah disentuh, filter sheet, chart yang tidak overflow.
- Jadikan web sebagai PWA yang bisa dipasang.
- Siapkan API contract agar aplikasi native iOS/Android dapat dibuat terpisah nanti.
- Jangan mengubah desain menjadi generik; pertahankan identitas PerumNet dan perbaiki UX seperlunya.

## Database

- Rencanakan migrasi dari SQLite ke PostgreSQL untuk production, memakai Drizzle.
- Buat schema untuk asset mapping, CRM service mapping, incident, acknowledgement, audit log, notification delivery log, topology, topology node, topology link, topology discovery suggestion, dan topology version/publish state.
- Buat migration yang aman dan dokumentasikan rollback.
- Jangan migrasikan telemetry mock sebagai data produksi.

## Keamanan

- Semua endpoint wajib auth, authorization berbasis role, validasi input, rate limit, dan audit log.
- Token LibreNMS, secret webhook, Telegram/WhatsApp token hanya dari environment.
- Pastikan response API tidak membocorkan credential atau data internal kepada customer.
- Tambahkan `.env.example` tanpa nilai rahasia.

## LibreNMS dan Proxmox

- Buat dokumentasi deployment, bukan eksekusi server.
- Dokumentasikan VM Debian 12 terpisah, Docker Compose LibreNMS, baseline 4 vCPU / 8 GB RAM / 100 GB SSD, VLAN management, firewall, HTTPS, SNMPv3 read-only, backup, restore, dan onboarding perangkat.
- Portal harus diasumsikan berjalan pada VM berbeda dari LibreNMS.

## Tahapan implementasi wajib

1. **Fase 0 — Audit:** baca project dan dokumen ini sepenuhnya, petakan sisa PRTG, arsitektur, contract API, dan risiko; jangan mengubah kode.
2. **Fase 1 — Fondasi domain/API:** model LibreNMS, asset, role jaringan, contract `/api/v1`, serta penghapusan istilah PRTG tanpa integrasi nyata.
3. **Fase 2 — Database:** schema/migration aman untuk asset, mapping CRM eksternal, incident, audit, dan topology; dokumentasikan rollback.
4. **Fase 3 — Adapter LibreNMS:** adapter server-side, cache aman, data perangkat/port/health/availability/discovery topologi, dan test tanpa token nyata.
5. **Fase 4 — Incident/notification:** webhook idempoten, acknowledge, audit trail, serta integrasi notifikasi server-side.
6. **Fase 5 — Topologi:** canvas manual, persistence draft/version, discovery suggestion, review/confirm/publish, RBAC, dan responsive QA.
7. **Fase 6 — CRM eksternal/customer:** contract mapping, adapter/webhook/deep link tanpa membangun CRM, lalu isolasi portal customer.
8. **Fase 7 — UI/PWA:** hubungkan semua halaman ke API v1, responsive QA desktop/tablet/mobile, tanpa merombak identitas PerumNet.
9. **Fase 8 — Dokumentasi/readiness:** runbook Proxmox/LibreNMS, environment variables, backup/restore, checklist go-live dan rollback.

Selesaikan tepat satu fase per respons dan berhenti untuk menunggu instruksi eksplisit sebelum memulai fase berikutnya.

## Verifikasi

1. Tambahkan test untuk adapter LibreNMS, RBAC, webhook idempotency, customer data isolation, mapping CRM eksternal, topology manual, topology discovery review, dan publish/versioning.
2. Jalankan lint, typecheck, build, dan test.
3. Uji halaman utama pada desktop, tablet, dan mobile.
4. Laporkan file yang diubah, migration, endpoint baru, hasil test, serta item yang tidak bisa diverifikasi tanpa LibreNMS/server nyata.
5. Jangan menyatakan integrasi real LibreNMS berhasil bila belum tersedia URL, token, dan perangkat uji.

Mulai dengan audit project, lalu implementasikan secara bertahap. Setelah selesai, berikan ringkasan perubahan dan panduan environment variable yang dibutuhkan.
