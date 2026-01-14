import type { ReactElement, ReactNode } from "react";
import { AiChatWidget } from "./AiChatWidget";

type AppShellProps = {
  children: ReactNode;
  showAiWidget?: boolean;
};

export function AppShell({ children, showAiWidget = true }: AppShellProps): ReactElement {
  return (
    <div className="max-h-screen bg-slate-50 w-full overflow-hidden">
      <div className="px-6 py-6">{children}</div>
      {showAiWidget && <AiChatWidget />}
    </div>
  );
}
