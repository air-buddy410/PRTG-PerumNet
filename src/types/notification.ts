export type ChannelType = "telegram" | "whatsapp";

export type NotificationSendStatus = "sent" | "failed";

// Mengikuti skema tabel notification_logs pada PRD.
export interface NotificationLog {
  id: string;
  prtgSensorId: string;
  deviceName: string;
  alertType: ChannelType;
  messageContent: string;
  status: NotificationSendStatus;
  triggeredAt: string;
  /** Catatan solusi/tindak lanjut yang diisi tim NOC. */
  resolutionNote?: string;
}

export interface NotificationChannel {
  id: string;
  type: ChannelType;
  /** Nama pemilik/penerima channel. */
  recipientName: string;
  /** Username Telegram atau nomor WhatsApp tujuan. */
  target: string;
  verified: boolean;
  active: boolean;
  addedAt: string;
}
