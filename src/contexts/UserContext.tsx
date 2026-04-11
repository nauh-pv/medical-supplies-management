import { createContext, useContext } from "react";
import type { UserDoc } from "@/types/firestore";

export const UserContext = createContext<UserDoc | null>(null);

export function useUserContext(): UserDoc | null {
  return useContext(UserContext);
}
