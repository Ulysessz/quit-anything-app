import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const [profile] = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.userEmail, user.email))
    .limit(1);

  return Response.json({
    profile: profile ?? null,
    user: { displayName: user.fullName ?? user.displayName },
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const payload = (await request.json()) as Record<string, unknown>;
  const required = ["habit", "approach", "reason", "replacementPlan"] as const;
  for (const field of required) {
    if (typeof payload[field] !== "string" || !payload[field].trim()) {
      return Response.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const values = {
    userEmail: user.email,
    displayName:
      typeof payload.displayName === "string" && payload.displayName.trim()
        ? payload.displayName.trim()
        : user.fullName ?? user.displayName,
    habit: String(payload.habit).trim(),
    approach: String(payload.approach).trim(),
    reason: String(payload.reason).trim(),
    dangerDays: Array.isArray(payload.dangerDays)
      ? payload.dangerDays.map(String).join(",")
      : "",
    dangerStart: typeof payload.dangerStart === "string" ? payload.dangerStart : "17:00",
    dangerEnd: typeof payload.dangerEnd === "string" ? payload.dangerEnd : "20:00",
    replacementPlan: String(payload.replacementPlan).trim(),
    reminderEnabled:
      typeof payload.reminderEnabled === "boolean"
        ? payload.reminderEnabled
        : true,
    reminderDays: Array.isArray(payload.reminderDays)
      ? payload.reminderDays.map(String).join(",")
      : typeof payload.reminderDays === "string"
        ? payload.reminderDays
        : "Mon,Tue,Wed,Thu,Fri",
    reminderTime:
      typeof payload.reminderTime === "string" ? payload.reminderTime : "16:30",
    updatedAt: new Date().toISOString(),
  };

  const [profile] = await getDb()
    .insert(profiles)
    .values(values)
    .onConflictDoUpdate({
      target: profiles.userEmail,
      set: values,
    })
    .returning();

  return Response.json({ profile }, { status: 201 });
}
