// Dijalankan Next.js sekali saat server start.
// Worker pengumpul telemetry era SQLite telah dipensiunkan (Fase 2):
// telemetry menjadi tanggung jawab LibreNMS (adapter menyusul di Fase 3).

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureAdminUser } = await import("@/server/bootstrap-admin");
    await ensureAdminUser().catch((error) => {
      console.error("[bootstrap] gagal menyiapkan akun admin:", error);
    });
  }
}
