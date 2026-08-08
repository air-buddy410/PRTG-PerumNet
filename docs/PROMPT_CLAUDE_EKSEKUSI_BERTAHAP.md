# Prompt Claude — Eksekusi Bertahap PerumNet NOC

Salin seluruh instruksi berikut ke Claude dari root repository.

---

Kamu bekerja di repository **PerumNet NOC Monitoring Portal**.

Dokumen acuan utama yang wajib kamu baca sampai selesai sebelum melakukan apa pun adalah:

`docs/PROMPT_CLAUDE_IMPLEMENTASI_LIBRENMS.md`

Dokumen tersebut adalah source of truth. Ia mencakup target LibreNMS, topologi jaringan, integrasi CRM eksternal, RBAC, keamanan, UI, database, Proxmox, dan kriteria verifikasi.

## Aturan kerja yang tidak boleh dilanggar

1. Kerjakan **satu fase per respons**. Setelah satu fase selesai, berhenti dan tunggu instruksi saya `LANJUT FASE N`.
2. Jangan memulai fase berikutnya, bahkan jika pekerjaan terlihat kecil atau mudah, tanpa instruksi eksplisit tersebut.
3. Sebelum mengubah kode, audit struktur project, stack, schema, auth/RBAC, API, data mock, test, dan environment yang relevan dengan fase aktif.
4. Jangan deploy, push Git, mengubah Proxmox, mengakses LibreNMS nyata, atau memanggil CRM nyata tanpa akses dan persetujuan eksplisit.
5. Jangan menaruh token, secret webhook, kredensial SNMP, token Telegram/WhatsApp, atau credential CRM pada frontend, source code, log, fixture, atau commit. Gunakan environment variable dan `.env.example` tanpa nilai rahasia.
6. Jangan menyatakan LibreNMS, CRM, notifikasi, atau discovery nyata berhasil tanpa URL, secret, perangkat uji, dan bukti pengujian nyata.
7. Pertahankan identitas PerumNet, logo, favicon, dan kualitas responsive UI yang sudah ada. Jangan mengganti UI menjadi desain generik.
8. Jangan menghapus data atau fitur valid tanpa migration aman, rollback yang didokumentasikan, dan test yang relevan.
9. Gunakan data fixture/mock hanya untuk development dan beri label jelas. Jangan mencampurnya dengan data operasional.
10. Setelah menyelesaikan fase, selalu laporkan:
    - ringkasan perubahan;
    - file yang dibuat atau diubah;
    - schema/migration dan endpoint yang ditambahkan atau diubah;
    - test, lint, typecheck, dan build yang dijalankan beserta hasilnya;
    - verifikasi desktop, tablet, dan mobile bila fase menyentuh UI;
    - risiko, asumsi, serta item yang memerlukan LibreNMS/CRM/server nyata.

## Batasan CRM

- CRM PerumNet adalah aplikasi terpisah dan **tidak dibangun di repository ini**.
- Repository ini hanya membangun Portal dan contract integrasi API/webhook/deep link untuk CRM eksternal.
- Jangan membuat modul CRM, billing, ticketing, inventori CRM, formulir pelanggan lengkap, atau melakukan mutasi data CRM.
- Simpan hanya mapping minimal yang diperlukan Portal: external `customerId`, external `serviceId`, `assetId`/group LibreNMS, status sinkronisasi, dan audit log.

## Batasan dan aturan topologi

- Topologi manual adalah sumber desain operasional yang dapat diedit oleh role berwenang.
- Auto-discovery hanya mengambil relasi yang benar-benar tersedia dari LibreNMS, misalnya device relation atau neighbor LLDP/CDP/FDB.
- Hasil auto-discovery selalu berupa **rekomendasi** dengan sumber, waktu, dan confidence. Jangan otomatis menimpa, menghapus, atau memindahkan topologi manual/published.
- Hanya Admin/Engineer dapat mengubah, mengonfirmasi, menolak, atau publish topologi. NOC dapat melihat dan menggunakan sesuai RBAC pada dokumen acuan. Customer tidak dapat melihat topologi internal.
- Identitas node wajib mengutamakan metadata LibreNMS: vendor, OS, hardware/model, type, role, dan `assetId`; hostname hanya menjadi label. Override manual harus diaudit.

## Urutan fase

### Fase 0 — Audit dan rencana

Jangan ubah kode.

- Baca penuh `docs/PROMPT_CLAUDE_IMPLEMENTASI_LIBRENMS.md`.
- Audit project dan petakan seluruh jejak PRTG, komponen terdampak, schema, API, auth/RBAC, UI, test, dan environment.
- Petakan dependency antar fase, strategi migrasi SQLite ke PostgreSQL/Drizzle, strategi rollback, contract API v1, serta risiko topologi dan CRM eksternal.
- Buat rencana file-by-file dan kriteria selesai untuk setiap fase.
- Berhenti dan tunggu `LANJUT FASE 1`.

### Fase 1 — Fondasi domain dan contract API

- Refactor konsep PRTG menjadi LibreNMS pada type, naming, komentar, mock, dan endpoint contract.
- Siapkan `assetId`, `librenmsDeviceId`, metadata vendor/OS/model/role, serta contract `/api/v1`.
- Jangan menghubungkan LibreNMS nyata.
- Tambahkan test domain dan berhenti untuk menunggu `LANJUT FASE 2`.

### Fase 2 — Database dan audit trail

- Siapkan schema/migration aman untuk asset mapping, CRM external mapping, incident, acknowledgement, audit log, notification delivery log, topology, topology node, topology link, topology discovery suggestion, dan topology version/publish state.
- Dokumentasikan migration SQLite ke PostgreSQL dan rollback.
- Jangan membawa telemetry mock sebagai data produksi.
- Tambahkan test/migration lokal yang aman, lalu berhenti untuk menunggu `LANJUT FASE 3`.

### Fase 3 — Adapter LibreNMS server-side

- Buat adapter backend untuk device, port, health, alert, availability, event log, graph, trafik, serta sumber discovery topologi.
- Token LibreNMS hanya boleh di server melalui environment variable; sediakan fallback development yang aman.
- Tambahkan test adapter dan `.env.example` tanpa rahasia.
- Berhenti untuk menunggu `LANJUT FASE 4`.

### Fase 4 — Incident, webhook, dan notifikasi

- Buat webhook LibreNMS aman, tervalidasi, rate-limited, diaudit, dan idempoten untuk alert/recovery.
- Implementasikan acknowledge, resolution note, audit trail, serta delivery log notifikasi.
- Pertahankan Telegram/WhatsApp sebagai integrasi server-side; jangan gunakan mode simulasi pada konfigurasi production.
- Tambahkan test RBAC dan webhook idempotency, lalu berhenti untuk menunggu `LANJUT FASE 5`.

### Fase 5 — Topologi jaringan

- Buat halaman topologi responsif dengan mode Lihat, Edit Manual, dan Review Discovery.
- Implementasikan node/link manual, layout, draft/version, publish, filter, zoom/pan, drill-down, dan audit log.
- Implementasikan import/rekomendasi discovery LibreNMS serta alur terima/tolak/merge tanpa menimpa diagram manual.
- Tampilkan vendor, model, OS, role, status, dan nama perangkat secara konsisten.
- Tambahkan test topology manual, discovery review, RBAC, versioning/publish, serta QA desktop/tablet/mobile.
- Berhenti untuk menunggu `LANJUT FASE 6`.

### Fase 6 — CRM eksternal dan portal customer

- Implementasikan API contract mapping CRM eksternal, webhook incident/recovery outbound, retry/idempotency, error log, dan deep link yang aman.
- Jangan membangun atau memutasi CRM.
- Implementasikan customer portal dengan isolasi service/customer yang ketat tanpa menampilkan data internal/topologi.
- Tambahkan test customer isolation dan contract mapping, lalu berhenti untuk menunggu `LANJUT FASE 7`.

### Fase 7 — UI, PWA, dan responsive QA

- Hubungkan UI yang ada ke API v1 secara bertahap.
- Pastikan dashboard, aset, detail perangkat, peta, topologi, notifikasi, laporan, profile, user management, dan portal customer rapi di desktop, tablet, dan mobile.
- Pastikan PWA memakai favicon dan ikon PerumNet yang ada serta tidak terjadi overflow, broken interaction, atau token exposure.
- Jalankan QA visual/interaksi dan berhenti untuk menunggu `LANJUT FASE 8`.

### Fase 8 — Dokumentasi dan readiness

- Buat dokumentasi deployment LibreNMS di Debian 12/Proxmox, Docker Compose, VLAN management, firewall, HTTPS, SNMPv3, backup, restore, dan onboarding perangkat.
- Dokumentasikan environment variable, contract CRM eksternal, topology discovery limits, runbook, checklist go-live, dan rollback.
- Jangan mengeksekusi perubahan server.
- Berikan ringkasan akhir beserta item yang belum dapat divalidasi tanpa infrastruktur nyata.

Mulai sekarang dengan **Fase 0 saja**. Jangan mengubah kode pada fase ini dan jangan lanjut sebelum saya memberi perintah `LANJUT FASE 1`.
