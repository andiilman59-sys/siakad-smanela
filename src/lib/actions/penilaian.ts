"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Grade, Semester } from "@/types/database"

export async function getNilai(classId: string, subjectId: string, semester?: Semester): Promise<{ success: boolean; data?: Grade[]; error?: string }> {
  try {
    const admin = createAdminClient()
    let query = admin
      .from("grades")
      .select("*")
      .eq("subject_id", subjectId)

    if (semester) {
      query = query.eq("semester", semester)
    }

    const { data, error } = await query.order("assessment_date")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Grade[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch grades" }
  }
}

interface NilaiRecord {
  student_id: string
  subject_id: string
  teacher_id: string
  academic_year_id: string
  semester: Semester
  grade_type: string
  score: number
  max_score: number
  weight: number
  description?: string
  assessment_date: string
}

export async function saveNilai(records: NilaiRecord[]): Promise<{ success: boolean; data?: Grade[]; error?: string }> {
  try {
    const admin = createAdminClient()

    const upserts = await Promise.all(
      records.map(async (record) => {
        const { data: existing } = await admin
          .from("grades")
          .select("id")
          .eq("student_id", record.student_id)
          .eq("subject_id", record.subject_id)
          .eq("grade_type", record.grade_type)
          .eq("assessment_date", record.assessment_date)
          .single()

        if (existing) {
          const { data, error } = await admin
            .from("grades")
            .update({
              score: record.score,
              max_score: record.max_score,
              weight: record.weight,
              description: record.description
            })
            .eq("id", existing.id)
            .select()
            .single()

          if (error) throw error
          return data
        } else {
          const { data, error } = await admin
            .from("grades")
            .insert(record)
            .select()
            .single()

          if (error) throw error
          return data
        }
      })
    )

    revalidatePath("/penilaian")
    return { success: true, data: upserts as Grade[] }
  } catch (error) {
    return { success: false, error: "Failed to save grades" }
  }
}

export async function getRekapNilai(studentId: string): Promise<{ success: boolean; data?: Grade[]; error?: string }> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("grades")
      .select("*")
      .eq("student_id", studentId)
      .order("assessment_date", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Grade[] }
  } catch (error) {
    return { success: false, error: "Failed to fetch student grades" }
  }
}
