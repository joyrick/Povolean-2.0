import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { ChatDashboardPageClient } from "./ChatDashboardPageClient";

export default async function Page(): Promise<ReactElement> {
  const session = await getServerSession(authOptions);
  if (session === null) {
    redirect("/auth/login");
  }
  return <ChatDashboardPageClient />;
}
