import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredUser = {
  email: string;
  password: string;
};

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

async function ensureUsersFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(usersFile, "utf8");
  } catch {
    await writeFile(usersFile, "[]", "utf8");
  }
}

export async function readUsers() {
  await ensureUsersFile();
  const raw = await readFile(usersFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addUser(user: StoredUser) {
  const users = await readUsers();
  users.push(user);
  await writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}
