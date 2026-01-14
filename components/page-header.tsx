"use client";

import type { ReactNode, ReactElement } from "react";
import { Bell, Bot } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { Button } from "./ui/button";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({
  title = "Stavebné povolenie",
  subtitle = "Kolaboratívna platforma",
  actions,
}: PageHeaderProps): ReactElement {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated" && session != null;
  const isOnChatPage = pathname === "/chat";

  return (
    <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
      {/* left: logo + title */}
      <div className="flex items-center gap-3">
        <img src="/img/logo_2.png" alt="Povolean logo" width={50} height={50} />

        <div className="flex flex-row gap-10 justify-center items-center">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle !== undefined && subtitle !== "" && (
              <p className="mt-0.5 text-md text-slate-500">{subtitle}</p>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Zvolený projekt
            </span>
            <span className="text-sm font-semibold text-slate-700">Nuppu</span>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-3">
          {!isOnChatPage && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              onClick={() => router.push("/chat")}
            >
              <Bot className="h-4 w-4" />
              <span>Agent</span>
            </Button>
          )}
          {isOnChatPage && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full"
              onClick={() => router.push("/")}
            >
              <span>Dashboard</span>
            </Button>
          )}
          <Bell className="h-5 w-5 text-slate-500" />
          {actions !== undefined && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
          <LogoutButton />
        </div>
      )}
    </header>
  );
}
