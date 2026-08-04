"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { AcademicYear } from "@/types/database"

export async function getTahunAjaran(): Promise<{ success: boolean; data?: AcademicYear[]; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("academic_years")
      .select("*")
      .order("start_date", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as AcademicYear[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch academic years" }
  }
}

export async function createTahunAjaran(data: Partial<AcademicYear>): Promise<{ success: boolean; data?: AcademicYear; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: newYear, error } = await admin
      .from("academic_years")
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/tahun-ajaran")
    return { success: true, data: newYear as AcademicYear }
  } catch (error) {
    return { success: false, error: "Failed to create academic year" }
  }
}

export async function updateTahunAjaran(id: string, data: Partial<AcademicYear>): Promise<{ success: boolean; data?: AcademicYear; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: updatedYear, error } = await admin
      .from("academic_years")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/tahun-ajaran")
    return { success: true, data: updatedYear as AcademicYear }
  } catch (error) {
    return { success: false, error: "Failed to update academic year" }
  }
}

export async function deleteTahunAjaran(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("academic_years")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/tahun-ajaran")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete academic year" }
  }
}
