export function buildChatPrompt(
  userMessage: string,
  systemContext?: string
): string {
  const system =
    systemContext ??
    "Si AI asistent pre stavebné konanie na Slovensku. Odpovedaj odborne, vecne a stručne.";

  return `${system}\n\nUser: ${userMessage}`;
}
