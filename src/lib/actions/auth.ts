"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database"

export async function getCurrentUser(): Promise<{ success: boolean; data?: Profile; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const admin = createAdminClient()
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    return { success: true, data: profile as Profile }
  } catch (error) {
    return { success: false, error: "Failed to get current user" }
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/login")
    redirect("/login")
  } catch (error) {
    return { success: false, error: "Failed to sign out" }
  }
}
