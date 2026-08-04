"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardStats, getRecentActivity } from "@/lib/actions/dashboard"
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Calendar,
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  Bell,
} from "lucide-react"
import type { Announcement, Notification } from "@/types/database"

interface DashboardStats {
  totalSiswa: number
  totalGuru: number
  totalKelas: number
  totalPengumuman: number
}

const quickActions = [
  { title: "Presensi Hari Ini", icon: ClipboardCheck, href: "/presensi" },
  { title: "Jadwal Mengajar", icon: Calendar, href: "/jadwal" },
  { title: "Input Nilai", icon: FileText, href: "/penilaian" },
  { title: "Pengumuman", icon: Bell, href: "/pengumuman" },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [statsResult, activityResult] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
      ])
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }
      if (activityResult.success && activityResult.data) {
        setAnnouncements(activityResult.data.announcements)
        setNotifications(activityResult.data.notifications)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const statCards = [
    {
      title: "Total Siswa",
      value: stats?.totalSiswa ?? 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Guru",
      value: stats?.totalGuru ?? 0,
      icon: GraduationCap,
      color: "bg-green-500",
    },
    {
      title: "Total Kelas",
      value: stats?.totalKelas ?? 0,
      icon: School,
      color: "bg-purple-500",
    },
    {
      title: "Pengumuman Aktif",
      value: stats?.totalPengumuman ?? 0,
      icon: BookOpen,
      color: "bg-orange-500",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Berikut ringkasan data akademik hari ini.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString("id-ID")}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aksi Cepat</CardTitle>
          <CardDescription>Akses cepat ke fitur yang sering digunakan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4"
                asChild
              >
                <a href={action.href}>
                  <action.icon className="h-5 w-5 text-blue-600" />
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {action.title}
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengumuman Terbaru</CardTitle>
            <CardDescription>Pengumuman yang baru saja dipublikasikan</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada pengumuman</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="border rounded-lg p-3">
                    <div className="font-medium text-sm">{a.title}</div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{a.content}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(a.published_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifikasi Terbaru</CardTitle>
            <CardDescription>Notifikasi sistem terkini</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada notifikasi</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex items-start gap-3 border rounded-lg p-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                        n.type === "error"
                          ? "bg-red-500"
                          : n.type === "warning"
                          ? "bg-yellow-500"
                          : n.type === "success"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-sm">{n.title}</div>
                      <p className="text-xs text-gray-500 line-clamp-1">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
