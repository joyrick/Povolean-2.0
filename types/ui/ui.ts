import type { ReactNode } from "react";

export type AppShellProps = {
  children: ReactNode;
};

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};
