import { NextResponse } from "next/server";
import { getLiumPods } from "../../../lib/lium/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pods = await getLiumPods();
    const list = Array.isArray(pods) ? pods : (pods?.pods || []);
    return NextResponse.json({
      ok: true,
      pods: list.map((p) => ({
        id: p.id,
        huid: p.huid,
        name: p.name,
        status: p.status,
        price_per_hour: p.price_per_hour ?? p.executor?.price_per_gpu ?? null,
        gpu: p.gpu_type ?? p.executor?.machine_name ?? p.executor?.gpu_type ?? null,
        gpu_count: p.gpu_count ?? p.executor?.gpu_count ?? null,
        spent_usd: p.spent_usd ?? null,
        uptime: p.uptime ?? null,
        removal_scheduled_at: p.removal_scheduled_at ?? null,
        ssh_ready: Boolean(p.ssh_connect_cmd || p.ssh_cmd || p.ssh_command)
      }))
    });
  } catch (error) {
    return NextResponse.json({ok:false, reason:error.message, status:error.status ?? null},{status:error.status || 500});
  }
}