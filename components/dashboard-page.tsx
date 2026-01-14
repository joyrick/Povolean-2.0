"use client";

import type { ReactElement } from "react";
import { AppShell } from "./app-shell";
import { PageHeader } from "./page-header";
import { SectionColumn } from "./section-column";
import { getSectionsBoard } from "@/types/ui/sections-content";

export function DashboardPage(): ReactElement {
  const sections = getSectionsBoard();

  return (
    <AppShell showAiWidget={false}>
      <div className="mx-auto flex h-[calc(100vh-0.001rem)]  flex-col overflow-hidden">
        <PageHeader />

        <div className="mt-6 flex flex-1 justify-center overflow-y-hidden overflow-x-auto">
          {sections.map((section) => (
            <SectionColumn key={section.id} section={section} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
