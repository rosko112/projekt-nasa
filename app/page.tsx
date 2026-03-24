"use client";

import { useState } from "react";

type Fact = {
  title: string;
  date: string;
  explanation: string;
  url: string;
  mediaType: string;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loadingFact, setLoadingFact] = useState(false);
  const [fact, setFact] = useState<Fact | null>(null);

  async function runAuth(mode: "signup" | "login") {
    setMessage("");

    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Request failed.");
      return;
    }

    if (mode === "signup") {
      setMessage("Signup successful. Now log in.");
      return;
    }

    setLoggedIn(true);
    setMessage("Logged in.");
  }

  async function generateFact() {
    setLoadingFact(true);
    setMessage("");

    const response = await fetch("/api/nasa/fact");
    const payload = (await response.json()) as Fact & { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Could not load space data.");
      setLoadingFact(false);
      return;
    }

    setFact(payload);
    setLoadingFact(false);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">Simple NASA Space Facts</h1>

      {!loggedIn ? (
        <form
          className="flex flex-col gap-3 rounded border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void runAuth("login");
          }}
        >
          <input
            className="rounded border p-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="rounded border p-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex gap-2">
            <button className="rounded bg-black px-4 py-2 text-white" type="submit">
              Login
            </button>
            <button className="rounded border px-4 py-2" type="button" onClick={() => void runAuth("signup")}>
              Sign Up
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded border p-4">
          <button className="rounded bg-black px-4 py-2 text-white" onClick={generateFact} disabled={loadingFact}>
            {loadingFact ? "Loading..." : "Generate Space Fact"}
          </button>

          {fact ? (
            <div className="mt-4 space-y-2">
              <h2 className="text-xl font-semibold">{fact.title}</h2>
              <p className="text-sm opacity-70">{fact.date}</p>
              <p>{fact.explanation}</p>
              {fact.url ? (
                <a className="text-blue-600 underline" href={fact.url} target="_blank" rel="noreferrer">
                  Open NASA media
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </main>
  );
}
