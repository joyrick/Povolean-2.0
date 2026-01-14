import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import "./globals.css";
import { StepsProvider } from "@/context/steps-provider";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "stavebko.digital AI prototyp",
  description:
    "Prototyp na zníženie chybovosti podaní a zrýchlenie schvaľovania stavebného konania.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps): ReactElement {
  return (
    <html lang="sk">
      <body className="bg-slate-50 text-slate-900">
        <Providers>
          <StepsProvider>{children}</StepsProvider>
        </Providers>
      </body>
    </html>
  );
}
