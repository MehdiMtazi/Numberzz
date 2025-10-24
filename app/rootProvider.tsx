"use client";
import { ReactNode } from "react";

export function RootProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
