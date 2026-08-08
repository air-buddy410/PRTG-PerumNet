import type { Metadata } from "next";
import DeviceDetail from "@/components/devices/device-detail";

export const metadata: Metadata = {
  title: "Monitor Detail Perangkat — PerumNet",
  description:
    "Detail metrik perangkat jaringan: CPU, RAM, bandwidth, dan kesehatan optik.",
};

export default async function DeviceDetailPage({
  params,
}: PageProps<"/devices/[id]">) {
  const { id } = await params;

  return (
    <main className="noc-page noc-device-detail-page">
      <DeviceDetail deviceId={id} />
    </main>
  );
}
