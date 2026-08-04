"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Subject } from "@/types/database"

interface MapelFilters {
  search?: string
  grade_level?: number
  semester?: string
  is_active?: boolean
}

export async function getMapel(filters?: MapelFilters): Promise<{ success: boolean; data?: Subject[]; error?: string }> {
  try {
    const admin = createAdminClient()
    let query = admin.from("subjects").select("*")

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }

    if (filters?.grade_level) {
      query = query.eq("grade_level", filters.grade_level)
    }

    if (filters?.semester) {
      query = query.eq("semester", filters.semester)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active)
    }

    const { data, error } = await query.order("code")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Subject[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch subjects" }
  }
}

export async function createMapel(data: Partial<Subject>): Promise<{ success: boolean; data?: Subject; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: newSubject, error } = await admin
      .from("subjects")
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/mapel")
    return { success: true, data: newSubject as Subject }
  } catch (error) {
    return { success: false, error: "Failed to create subject" }
  }
}

export async function updateMapel(id: string, data: Partial<Subject>): Promise<{ success: boolean; data?: Subject; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: updatedSubject, error } = await admin
      .from("subjects")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/mapel")
    return { success: true, data: updatedSubject as Subject }
  } catch (error) {
    return { success: false, error: "Failed to update subject" }
  }
}

export async function deleteMapel(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("subjects")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/mapel")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete subject" }
  }
}
