"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Teacher } from "@/types/database"

interface GuruFilters {
  search?: string
  status?: string
}

export async function getGuru(filters?: GuruFilters): Promise<{ success: boolean; data?: Teacher[]; error?: string }> {
  try {
    const admin = createAdminClient()
    let query = admin.from("teachers").select("*")

    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,nip.ilike.%${filters.search}%,nuptk.ilike.%${filters.search}%`)
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    const { data, error } = await query.order("full_name")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Teacher[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch teachers" }
  }
}

export async function createGuru(data: Partial<Teacher>): Promise<{ success: boolean; data?: Teacher; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: newTeacher, error } = await admin
      .from("teachers")
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/guru")
    return { success: true, data: newTeacher as Teacher }
  } catch (error) {
    return { success: false, error: "Failed to create teacher" }
  }
}

export async function updateGuru(id: string, data: Partial<Teacher>): Promise<{ success: boolean; data?: Teacher; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: updatedTeacher, error } = await admin
      .from("teachers")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/guru")
    return { success: true, data: updatedTeacher as Teacher }
  } catch (error) {
    return { success: false, error: "Failed to update teacher" }
  }
}

export async function deleteGuru(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("teachers")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/guru")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete teacher" }
  }
}
