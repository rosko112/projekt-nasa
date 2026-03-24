import { NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE_NAME } from "@/lib/session";
import { readUsers } from "@/lib/user-store";

export const runtime = "nodejs";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const users = await readUsers();
  const user = users.find((item) => item.email === email);

  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true, email });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionValue(email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
