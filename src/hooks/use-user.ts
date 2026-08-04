"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "guru" | "siswa" | "staff";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

const MOCK_USER: AppUser = {
  id: "mock-user-001",
  email: "admin@smanela.sch.id",
  name: "Administrator",
  role: "admin",
};

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient();
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();

        if (supabaseUser) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email ?? "",
            name:
              supabaseUser.user_metadata?.full_name ??
              supabaseUser.email?.split("@")[0] ??
              "User",
            role: (supabaseUser.user_metadata?.role as UserRole) ?? "admin",
            avatarUrl: supabaseUser.user_metadata?.avatar_url,
          });
        } else {
          setUser(MOCK_USER);
        }
      } catch {
        setUser(MOCK_USER);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading };
}
