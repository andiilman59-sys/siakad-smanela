"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Schedule, Semester } from "@/types/database"

export async function getJadwal(classId: string, semester?: Semester): Promise<{ success: boolean; data?: Schedule[]; error?: string }> {
  try {
    const admin = createAdminClient()
    let query = admin
      .from("schedules")
      .select("*")
      .eq("class_id", classId)

    if (semester) {
      query = query.eq("semester", semester)
    }

    const { data, error } = await query.order("day_of_week").order("start_time")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Schedule[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch schedule" }
  }
}

export async function createJadwal(data: Partial<Schedule>): Promise<{ success: boolean; data?: Schedule; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data: newSchedule, error } = await admin
      .from("schedules")
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/jadwal")
    return { success: true, data: newSchedule as Schedule }
  } catch (error) {
    return { success: false, error: "Failed to create schedule" }
  }
}

export async function deleteJadwal(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("schedules")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/jadwal")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete schedule" }
  }
}

interface JadwalBentrokCheck {
  class_id: string
  day_of_week: number
  start_time: string
  end_time: string
  semester: Semester
  academic_year_id: string
  exclude_id?: string
}

export async function checkJadwalBentrok(data: JadwalBentrokCheck): Promise<{ success: boolean; data?: { bentrok: boolean; conflicts?: Schedule[] }; error?: string }> {
  try {
    const admin = createAdminClient()
    let query = admin
      .from("schedules")
      .select("*")
      .eq("class_id", data.class_id)
      .eq("day_of_week", data.day_of_week)
      .eq("semester", data.semester)
      .eq("academic_year_id", data.academic_year_id)
      .or(`start_time.lt.${data.end_time},end_time.gt.${data.start_time}`)

    if (data.exclude_id) {
      query = query.neq("id", data.exclude_id)
    }

    const { data: conflicts, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: {
        bentrok: (conflicts?.length || 0) > 0,
        conflicts: conflicts as Schedule[]
      }
    }
  } catch (error) {
    return { success: false, error: "Failed to check schedule conflicts" }
  }
}
