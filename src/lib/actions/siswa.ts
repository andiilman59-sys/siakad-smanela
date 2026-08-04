"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Student } from "@/types/database"

interface SiswaFilters {
  search?: string
  class_id?: string
  academic_year_id?: string
  status?: string
}

export async function getSiswa(filters?: SiswaFilters): Promise<{ success: boolean; data?: Student[]; error?: string }> {
  try {
    const admin = createAdminClient()
    let query = admin.from("students").select("*")

    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,nisn.ilike.%${filters.search}%,nis.ilike.%${filters.search}%`)
    }

    if (filters?.class_id) {
      query = query.eq("class_id", filters.class_id)
    }

    if (filters?.academic_year_id) {
      query = query.eq("academic_year_id", filters.academic_year_id)
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    const { data, error } = await query.order("full_name")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Student[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch students" }
  }
}

export async function getSiswaById(id: string): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("students")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Student }
  } catch (error) {
    return { success: false, error: "Failed to fetch student" }
  }
}

export async function createSiswa(data: Partial<Student>): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: newStudent, error } = await admin
      .from("students")
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/siswa")
    return { success: true, data: newStudent as Student }
  } catch (error) {
    return { success: false, error: "Failed to create student" }
  }
}

export async function updateSiswa(id: string, data: Partial<Student>): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: updatedStudent, error } = await admin
      .from("students")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/siswa")
    return { success: true, data: updatedStudent as Student }
  } catch (error) {
    return { success: false, error: "Failed to update student" }
  }
}

export async function deleteSiswa(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("students")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/master-data/siswa")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete student" }
  }
}
