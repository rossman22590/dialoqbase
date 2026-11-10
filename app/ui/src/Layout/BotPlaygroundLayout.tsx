import React from "react";
import BotLayout from "./BotLayout";

// Conversations used to have its own copy of the bot layout. It now shares
// the one bot layout so the sidebar and top bar match everywhere.
export default function BotPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BotLayout>{children}</BotLayout>;
}
