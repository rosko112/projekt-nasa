import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readEmailFromSession, SESSION_COOKIE_NAME } from "@/lib/session";

export const runtime = "nodejs";

type NasaApodItem = {
  title?: string;
  date?: string;
  explanation?: string;
  url?: string;
  media_type?: string;
};

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const email = readEmailFromSession(session);

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.NASA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "NASA_API_KEY is missing in your env file." },
      { status: 500 }
    );
  }

  const nasaResponse = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(apiKey)}&count=1`,
    { cache: "no-store" }
  );

  if (!nasaResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch NASA data." },
      { status: 502 }
    );
  }

  const data = (await nasaResponse.json()) as NasaApodItem[] | NasaApodItem;
  const item = Array.isArray(data) ? data[0] : data;

  return NextResponse.json({
    title: item?.title || "Unknown title",
    date: item?.date || "Unknown date",
    explanation: item?.explanation || "No description available.",
    url: item?.url || "",
    mediaType: item?.media_type || "",
  });
}
