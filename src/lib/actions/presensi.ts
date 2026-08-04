"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Attendance, AttendanceStatus } from "@/types/database"

export async function getPresensi(classId: string, date: string): Promise<{ success: boolean; data?: Attendance[]; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("attendances")
      .select("*")
      .eq("schedule_id", classId)
      .eq("date", date)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Attendance[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch attendance" }
  }
}

export async function getRekapPresensi(studentId?: string): Promise<{ success: boolean; data?: Attendance[]; error?: string }> {
  try {
    const admin = createAdminClient()
    let query = admin.from("attendances").select("*")

    if (studentId) {
      query = query.eq("student_id", studentId)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Attendance[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch attendance recap" }
  }
}

interface PresensiRecord {
  student_id: string
  schedule_id: string
  date: string
  status: AttendanceStatus
  notes?: string
}

export async function savePresensi(records: PresensiRecord[]): Promise<{ success: boolean; data?: Attendance[]; error?: string }> {
  try {
    const admin = createAdminClient()

    const upserts = await Promise.all(
      records.map(async (record) => {
        const { data: existing } = await admin
          .from("attendances")
          .select("id")
          .eq("student_id", record.student_id)
          .eq("schedule_id", record.schedule_id)
          .eq("date", record.date)
          .single()

        if (existing) {
          const { data, error } = await admin
            .from("attendances")
            .update({
              status: record.status,
              notes: record.notes
            })
            .eq("id", existing.id)
            .select()
            .single()

          if (error) throw error
          return data
        } else {
          const { data, error } = await admin
            .from("attendances")
            .insert(record)
            .select()
            .single()

          if (error) throw error
          return data
        }
      })
    )

    revalidatePath("/presensi")
    return { success: true, data: upserts as Attendance[] }
  } catch (error) {
    return { success: false, error: "Failed to save attendance" }
  }
}
