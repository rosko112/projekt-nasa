import { NextResponse } from "next/server";
import { addUser, readUsers } from "@/lib/user-store";

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
  const exists = users.some((user) => user.email === email);

  if (exists) {
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 }
    );
  }

  await addUser({ email, password });
  return NextResponse.json({ ok: true });
}
