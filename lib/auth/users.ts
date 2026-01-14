import type { AppUser } from "@/types/auth";

type UserRecord = AppUser & {
  password: string;
};

const users: UserRecord[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    password: "admin123",
  },
  {
    id: "2",
    name: "Developer User",
    email: "dev@example.com",
    role: "developer",
    password: "dev123",
  },
  {
    id: "3",
    name: "Authority User",
    email: "authority@example.com",
    role: "authority",
    password: "authority123",
  },
];

export function validateUser(email: string, password: string): AppUser | null {
  const user = users.find((u) => u.email === email && u.password === password);
  if (user === undefined) {
    return null;
  }
  const { password: _, ...safeUser } = user;
  return safeUser;
}
