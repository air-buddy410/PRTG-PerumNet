import { NextResponse } from "next/server";
import { getDeviceMeta } from "@/server/device-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getDeviceMeta());
}
