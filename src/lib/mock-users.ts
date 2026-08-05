import type { AppUser } from "@/types/user";

// Data tiruan pengguna aplikasi — nantinya dari tabel users (SQLite).
export const MOCK_USERS: AppUser[] = [
  {
    id: "usr-01",
    name: "Budi Dharma",
    email: "admin@perumnet.co.id",
    role: "admin",
    status: "active",
    createdAt: "2026-05-02T09:00:00+07:00",
  },
  {
    id: "usr-02",
    name: "Sari Wulandari",
    email: "sari@perumnet.co.id",
    role: "noc",
    status: "active",
    createdAt: "2026-05-10T10:30:00+07:00",
  },
  {
    id: "usr-03",
    name: "Agus Prasetyo",
    email: "agus@perumnet.co.id",
    role: "noc",
    status: "active",
    createdAt: "2026-05-12T14:20:00+07:00",
  },
  {
    id: "usr-04",
    name: "Rina Kartika",
    email: "rina@perumnet.co.id",
    role: "engineer",
    status: "active",
    createdAt: "2026-06-01T08:15:00+07:00",
  },
  {
    id: "usr-05",
    name: "Dodi Firmansyah",
    email: "dodi@perumnet.co.id",
    role: "engineer",
    status: "pending",
    createdAt: "2026-08-01T16:45:00+07:00",
  },
  {
    id: "usr-06",
    name: "Maya Anggraini",
    email: "maya@perumnet.co.id",
    role: "manajemen",
    status: "active",
    createdAt: "2026-06-20T11:00:00+07:00",
  },
];
