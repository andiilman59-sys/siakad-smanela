"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Class } from "@/types/database"

interface KelasFilters {
  search?: string
  academic_year_id?: string
  grade?: number
}

export async function getKelas(filters?: KelasFilters): Promise<{ success: boolean; data?: Class[]; error?: string }> {
  try {
    const admin = createAdminClient()
    let query = admin.from("classes").select("*")

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`)
    }

    if (filters?.academic_year_id) {
      query = query.eq("academic_year_id", filters.academic_year_id)
    }

    if (filters?.grade) {
      query = query.eq("grade", filters.grade)
    }

    const { data, error } = await query.order("grade").order("name")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Class[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch classes" }
  }
}

export async function getKelasWithCounts(): Promise<{ success: boolean; data?: (Class & { student_count: number })[]; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: classes, error: classError } = await admin
      .from("classes")
      .select("*")
      .order("grade")
      .order("name")

    if (classError) {
      return { success: false, error: classError.message }
    }

    const classesWithCounts = await Promise.all(
      (classes || []).map(async (cls) => {
        const { count } = await admin
          .from("class_students")
          .select("*", { count: "exact", head: true })
          .eq("class_id", cls.id)
          .eq("status", "active")

        return { ...cls, student_count: count || 0 }
      })
    )

    return { success: true, data: classesWithCounts as (Class & { student_count: number })[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch classes with counts" }
  }
}

export async function createKelas(data: Partial<Class>): Promise<{ success: boolean; data?: Class; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: newClass, error } = await admin
      .from("classes")
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/kelas")
    return { success: true, data: newClass as Class }
  } catch (error) {
    return { success: false, error: "Failed to create class" }
  }
}

export async function updateKelas(id: string, data: Partial<Class>): Promise<{ success: boolean; data?: Class; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: updatedClass, error } = await admin
      .from("classes")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/kelas")
    return { success: true, data: updatedClass as Class }
  } catch (error) {
    return { success: false, error: "Failed to update class" }
  }
}

export async function deleteKelas(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("classes")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/kelas")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete class" }
  }
}
