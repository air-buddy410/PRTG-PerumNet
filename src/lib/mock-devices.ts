// DEVELOPMENT FIXTURE — view-model legacy `NetworkDevice`, diturunkan dari
// FIXTURE_ASSETS (lihat src/lib/fixtures/assets.ts). Dipakai komponen UI lama
// sampai seluruh halaman pindah ke /api/v1 (Fase 7).

import { assetToLegacyDevice, FIXTURE_ASSETS } from "@/lib/fixtures/assets";
import type { NetworkDevice } from "@/types/device";

export const MOCK_DEVICES: NetworkDevice[] =
  FIXTURE_ASSETS.map(assetToLegacyDevice);
