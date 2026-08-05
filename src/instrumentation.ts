// Dijalankan Next.js sekali saat server start — tempat menyalakan worker
// pengumpul metrik (Job Scheduler pada arsitektur PRD).

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startMetricsCollector } = await import("@/server/collector");
    startMetricsCollector();

    const { ensureAdminUser } = await import("@/server/bootstrap-admin");
    await ensureAdminUser().catch((error) => {
      console.error("[bootstrap] gagal menyiapkan akun admin:", error);
    });
  }
}
