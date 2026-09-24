import { NextResponse } from "next/server";
import { getLiumAccount } from "../../../lib/lium/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const account = await getLiumAccount();
    return NextResponse.json({
      ok: true,
      authenticated: true,
      balance: account?.balance ?? account?.balance_usd ?? null
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      authenticated: false,
      reason: error.message,
      status: error.status ?? null
    }, { status: error.status || 500 });
  }
}
