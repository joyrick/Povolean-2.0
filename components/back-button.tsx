"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
  label?: string;
};

export function BackButton({ label = "Späť" }: BackButtonProps): ReactElement {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      className="cursor-pointer"
      size="sm"
      onClick={() => router.back()}
    >
      {label}
    </Button>
  );
}
