import type { ReactNode } from "react";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

type ScreenSafeAreaProps = {
  children: ReactNode;
  /** Defaults to all edges. Tab screens typically omit bottom (tab bar handles it). */
  edges?: readonly Edge[];
};

/** Minimal safe-area wrapper for scaffold screens — no styling. */
export function ScreenSafeArea({ children, edges }: ScreenSafeAreaProps) {
  return <SafeAreaView edges={edges}>{children}</SafeAreaView>;
}
