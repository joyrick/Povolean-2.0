"use client";

import type { ReactElement } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  label?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "icon" | "sm" | "default";
  className?: string;
};

function LogoutIcon({
  className = "h-12 w-12",
}: {
  className?: string;
}): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="11" width="12" height="9" rx="2" ry="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M21 12l-3-3" />
      <path d="M21 12l-3 3" />
      <path d="M13 12h8" />
    </svg>
  );
}

export function LogoutButton({
  label = "Odhlásiť sa",
  variant = "ghost",
  size = "default",
  className = "",
}: LogoutButtonProps): ReactElement {
  async function handleLogout(): Promise<void> {
    await signOut({
      callbackUrl: "/auth/login",
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => void handleLogout()}
      className={className}
    >
      <LogoutIcon className={"h-12 w-12"} />
    </Button>
  );
}
