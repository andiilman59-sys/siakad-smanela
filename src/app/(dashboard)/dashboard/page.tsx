"use client";

import { useUser } from "@/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const statsCards = [
  {
    title: "Total Siswa",
    value: "1,248",
    change: "+12%",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Total Guru",
    value: "72",
    change: "+3%",
    icon: GraduationCap,
    color: "bg-green-500",
  },
  {
    title: "Total Kelas",
    value: "36",
    change: "Stabil",
    icon: School,
    color: "bg-purple-500",
  },
  {
    title: "Mata Pelajaran",
    value: "24",
    change: "+2",
    icon: BookOpen,
    color: "bg-orange-500",
  },
];

const quickActions = [
  { title: "Presensi Hari Ini", icon: ClipboardCheck, href: "/dashboard/presensi" },
  { title: "Jadwal Mengajar", icon: Calendar, href: "/dashboard/jadwal" },
  { title: "Input Nilai", icon: FileText, href: "/dashboard/penilaian" },
  { title: "Pengumuman", icon: Bell, href: "/dashboard/pengumuman" },
];

const barData = [
  { name: "Jan", siswa: 40, guru: 24 },
  { name: "Feb", siswa: 30, guru: 13 },
  { name: "Mar", siswa: 20, guru: 98 },
  { name: "Apr", siswa: 27, guru: 39 },
  { name: "Mei", siswa: 18, guru: 48 },
  { name: "Jun", siswa: 23, guru: 38 },
];

const pieData = [
  { name: "Laki-laki", value: 624, color: "#3b82f6" },
  { name: "Perempuan", value: 624, color: "#ec4899" },
];

export default function DashboardPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {user?.name}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Berikut ringkasan data akademik hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {stat.change} dari bulan lalu
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
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

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistik Kehadiran</CardTitle>
            <CardDescription>Data kehadiran siswa dan guru per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="siswa" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="guru" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Gender</CardTitle>
            <CardDescription>Perbandingan jumlah siswa laki-laki dan perempuan</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
