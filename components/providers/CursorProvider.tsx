"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type CursorMode = "default" | "text" | "view" | "drag" | "open" | "hidden";
export type CursorState = { mode: CursorMode; label?: string };

type Ctx = {
  state: CursorState;
  set: (mode: CursorMode, label?: string) => void;
  reset: () => void;
};

const CursorContext = createContext<Ctx>({ state: { mode: "default" }, set: () => {}, reset: () => {} });
export const useCursor = () => useContext(CursorContext);

export default function CursorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CursorState>({ mode: "default" });
  const set = useCallback((mode: CursorMode, label?: string) => setState({ mode, label }), []);
  const reset = useCallback(() => setState({ mode: "default" }), []);
  const value = useMemo(() => ({ state, set, reset }), [state, set, reset]);
  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}
