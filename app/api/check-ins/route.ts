import { desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { checkIns } from "../../../db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const rows = await getDb()
    .select()
    .from(checkIns)
    .where(eq(checkIns.userEmail, user.email))
    .orderBy(desc(checkIns.createdAt))
    .limit(30);
  return Response.json({ checkIns: rows });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const payload = (await request.json()) as {
    result?: string;
    urgeLevel?: number;
    trigger?: string;
    note?: string;
  };
  if (!["on-plan", "slip"].includes(payload.result ?? "")) {
    return Response.json({ error: "Valid result required" }, { status: 400 });
  }
  const [checkIn] = await getDb()
    .insert(checkIns)
    .values({
      userEmail: user.email,
      result: payload.result!,
      urgeLevel: Math.min(5, Math.max(1, Number(payload.urgeLevel) || 1)),
      trigger: payload.trigger?.trim() || "Other",
      note: payload.note?.trim() || "",
    })
    .returning();
  return Response.json({ checkIn }, { status: 201 });
}
