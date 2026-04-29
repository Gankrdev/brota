import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCareHistory } from "@/lib/dashboard/queries";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
  const limit = Math.min(Math.max(1, Number(url.searchParams.get("limit") ?? 20)), 50);

  const { entries, hasMore } = await getCareHistory({ offset, limit });

  return NextResponse.json({
    entries: entries.map((e) => ({ ...e, occurredAt: e.occurredAt.toISOString() })),
    hasMore,
  });
}
