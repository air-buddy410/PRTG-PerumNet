import type {
  NotificationChannel,
  NotificationLog,
} from "@/types/notification";

// Data tiruan channel notifikasi — nantinya dari tabel aplikasi (SQLite).
export const MOCK_CHANNELS: NotificationChannel[] = [
  {
    id: "ch-01",
    type: "telegram",
    recipientName: "NOC Shift 1",
    target: "@perumnet_noc1",
    verified: true,
    active: true,
    addedAt: "2026-06-12T08:30:00+07:00",
  },
  {
    id: "ch-02",
    type: "telegram",
    recipientName: "Grup NOC PerumNet",
    target: "-100987654321",
    verified: true,
    active: true,
    addedAt: "2026-06-12T09:00:00+07:00",
  },
  {
    id: "ch-03",
    type: "whatsapp",
    recipientName: "Budi (Engineer)",
    target: "+62 812-3456-7890",
    verified: true,
    active: false,
    addedAt: "2026-07-01T14:15:00+07:00",
  },
  {
    id: "ch-04",
    type: "whatsapp",
    recipientName: "Manajer Operasional",
    target: "+62 811-9876-5432",
    verified: false,
    active: false,
    addedAt: "2026-08-03T10:45:00+07:00",
  },
];

// Data tiruan log alert yang diteruskan sistem (skema notification_logs PRD).
export const MOCK_NOTIFICATION_LOGS: NotificationLog[] = [
  {
    id: "log-01",
    prtgSensorId: "13245",
    deviceName: "OLT ZTE C320 - Area Kebayoran",
    alertType: "telegram",
    messageContent: "🔴 DOWN: SFP PON gpon-olt_1/2 padam (Dying Gasp 3 ONU)",
    status: "sent",
    triggeredAt: "2026-08-05T13:58:21+07:00",
  },
  {
    id: "log-02",
    prtgSensorId: "13245",
    deviceName: "OLT ZTE C320 - Area Kebayoran",
    alertType: "whatsapp",
    messageContent: "🔴 DOWN: SFP PON gpon-olt_1/2 padam (Dying Gasp 3 ONU)",
    status: "failed",
    triggeredAt: "2026-08-05T13:58:24+07:00",
  },
  {
    id: "log-03",
    prtgSensorId: "11872",
    deviceName: "Ruijie RG-S2928 - Akses Palmerah",
    alertType: "telegram",
    messageContent: "🟡 WARNING: Latency naik 220 ms (ambang 150 ms)",
    status: "sent",
    triggeredAt: "2026-08-05T12:41:07+07:00",
    resolutionNote:
      "Uplink Palmerah dialihkan sementara ke jalur backup; latency normal kembali pukul 13.05.",
  },
  {
    id: "log-04",
    prtgSensorId: "10233",
    deviceName: "MikroTik CCR2004 - Core Menteng",
    alertType: "telegram",
    messageContent: "🟡 WARNING: CPU load 92% selama 5 menit",
    status: "sent",
    triggeredAt: "2026-08-05T11:12:44+07:00",
  },
  {
    id: "log-05",
    prtgSensorId: "12984",
    deviceName: "OLT ZTE C300 - Area Kuningan",
    alertType: "whatsapp",
    messageContent: "🟢 UP: SFP PON gpon-olt_1/1 kembali normal",
    status: "sent",
    triggeredAt: "2026-08-05T09:35:10+07:00",
  },
  {
    id: "log-06",
    prtgSensorId: "11872",
    deviceName: "Ruijie RG-S2928 - Akses Ciputat",
    alertType: "telegram",
    messageContent: "🔴 DOWN: Port Gi0/3 tidak merespons ping",
    status: "sent",
    triggeredAt: "2026-08-04T22:18:53+07:00",
    resolutionNote:
      "Kabel patch port Gi0/3 diganti oleh teknisi lapangan; link up pukul 23.40.",
  },
  {
    id: "log-07",
    prtgSensorId: "10561",
    deviceName: "MikroTik RB4011 - POP Kemayoran",
    alertType: "whatsapp",
    messageContent: "🟡 WARNING: Suhu perangkat 71°C (ambang 60°C)",
    status: "failed",
    triggeredAt: "2026-08-04T19:02:31+07:00",
  },
  {
    id: "log-08",
    prtgSensorId: "12984",
    deviceName: "OLT ZTE C300 - Area Kuningan",
    alertType: "telegram",
    messageContent: "🔴 DOWN: Rx Power ONU-1/1-05 di bawah -28 dBm",
    status: "sent",
    triggeredAt: "2026-08-04T16:47:19+07:00",
  },
];
