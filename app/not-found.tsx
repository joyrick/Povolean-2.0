// app/not-found.tsx
import type { ReactElement } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export default function NotFound(): ReactElement {
  return (
    <AppShell>
      <PageHeader />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
          <div className="w-full max-w-3xl text-center">
            <div className="flex flex-col items-center justify-center gap-10 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl text-left md:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                  Pracujeme na tom
                </h1>
                <p className="mt-4 text-base text-slate-500 md:text-lg">
                  Na tejto stránke usilovne pracujeme. Medzitým sa môžete vrátiť
                  na dashboard a pokračovať v práci so stavebným povolením.
                </p>
              </div>
              <img
                src="/img/work.png"
                alt="Pracujeme na tom"
                className="mx-auto w-56 md:w-72"
              />
            </div>
            <div className="mt-10 flex justify-center gap-3">
              <Button asChild className="px-8 py-6 text-base font-semibold">
                <Link href="/">Prejsť na dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
