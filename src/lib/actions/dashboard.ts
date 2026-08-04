"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { Announcement, Notification } from "@/types/database"

export async function getDashboardStats(): Promise<{ success: boolean; data?: { totalSiswa: number; totalGuru: number; totalKelas: number; totalPengumuman: number }; error?: string }> {
  try {
    const admin = createAdminClient()

    const [siswaResult, guruResult, kelasResult, pengumumanResult] = await Promise.all([
      admin.from("students").select("id", { count: "exact", head: true }),
      admin.from("teachers").select("id", { count: "exact", head: true }),
      admin.from("classes").select("id", { count: "exact", head: true }),
      admin.from("announcements").select("id", { count: "exact", head: true }).eq("is_published", true)
    ])

    if (siswaResult.error) throw siswaResult.error
    if (guruResult.error) throw guruResult.error
    if (kelasResult.error) throw kelasResult.error
    if (pengumumanResult.error) throw pengumumanResult.error

    return {
      success: true,
      data: {
        totalSiswa: siswaResult.count || 0,
        totalGuru: guruResult.count || 0,
        totalKelas: kelasResult.count || 0,
        totalPengumuman: pengumumanResult.count || 0
      }
    }
  } catch (error) {
    return { success: false, error: "Failed to fetch dashboard stats" }
  }
}

export async function getRecentActivity(): Promise<{ success: boolean; data?: { announcements: Announcement[]; notifications: Notification[] }; error?: string }> {
  try {
    const admin = createAdminClient()

    const [announcementsResult, notificationsResult] = await Promise.all([
      admin
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5),
      admin
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)
    ])

    if (announcementsResult.error) throw announcementsResult.error
    if (notificationsResult.error) throw notificationsResult.error

    return {
      success: true,
      data: {
        announcements: (announcementsResult.data || []) as Announcement[],
        notifications: (notificationsResult.data || []) as Notification[]
      }
    }
  } catch (error) {
    return { success: false, error: "Failed to fetch recent activity" }
  }
}
