"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  AlertTriangle,
  FileText,
  GraduationCap,
  MessageSquare,
  Info,
} from "lucide-react";

interface Notifikasi {
  id: string;
  judul: string;
  pesan: string;
  waktu: string;
  dibaca: boolean;
  tipe: string;
}

const initialData: Notifikasi[] = [
  {
    id: "1",
    judul: "Jadwal UTS Telah Dirilis",
    pesan: "Jadwal Ujian Tengah Semester Genap 2025/2026 telah dirilis. Silakan cek jadwal Anda.",
    waktu: "2 jam yang lalu",
    dibaca: false,
    tipe: "akademik",
  },
  {
    id: "2",
    judul: "Input Nilai Tempo Hari Ini",
    pesan: "Batas waktu input nilai tugas kelas X-A adalah hari ini pukul 23:59 WIB.",
    waktu: "3 jam yang lalu",
    dibaca: false,
    tipe: "peringatan",
  },
  {
    id: "3",
    judul: "Rapat Guru Besok",
    pesan: "Akan diadakan rapat guru pada hari Rabu, 22 Juli 2025 pukul 14:00 di ruang guru.",
    waktu: "5 jam yang lalu",
    dibaca: false,
    tipe: "kegiatan",
  },
  {
    id: "4",
    judul: "Siswa Baru Diterima",
    pesan: "Terdapat 5 siswa baru yang telah diterima untuk kelas X-A. Silakan cek data di menu siswa.",
    waktu: "1 hari yang lalu",
    dibaca: true,
    tipe: "info",
  },
  {
    id: "5",
    judul: "Pengumuman Rapor",
    pesan: "Pembagian rapor semester genap akan dilaksanakan pada tanggal 30 Juni 2026.",
    waktu: "2 hari yang lalu",
    dibaca: true,
    tipe: "akademik",
  },
  {
    id: "6",
    judul: "Pelanggaran Siswa Dicatat",
    pesan: "Ada 3 pelanggaran baru yang perlu ditindaklanjuti oleh wali kelas.",
    waktu: "3 hari yang lalu",
    dibaca: true,
    tipe: "peringatan",
  },
  {
    id: "7",
    judul: "Update Sistem",
    pesan: "Sistem telah diperbarui ke versi terbaru dengan perbaikan bug dan penambahan fitur.",
    waktu: "5 hari yang lalu",
    dibaca: true,
    tipe: "info",
  },
  {
    id: "8",
    judul: "Jadwal Piket Guru",
    pesan: "Jadwal piket guru bulan Juli 2026 telah tersedia. Silakan cek di menu jadwal.",
    waktu: "1 minggu yang lalu",
    dibaca: true,
    tipe: "kegiatan",
  },
];

export default function NotifikasiPage() {
  const [data, setData] = useState<Notifikasi[]>(initialData);
  const [filter, setFilter] = useState<"semua" | "belum" | "sudah">("semua");

  const filtered = data.filter((d) => {
    if (filter === "belum") return !d.dibaca;
    if (filter === "sudah") return d.dibaca;
    return true;
  });

  const unreadCount = data.filter((d) => !d.dibaca).length;

  const markAsRead = (id: string) => {
    setData((prev) => prev.map((d) => (d.id === id ? { ...d, dibaca: true } : d)));
  };

  const markAllAsRead = () => {
    setData((prev) => prev.map((d) => ({ ...d, dibaca: true })));
  };

  const getIcon = (tipe: string) => {
    switch (tipe) {
      case "akademik": return <GraduationCap className="h-5 w-5 text-blue-500" />;
      case "peringatan": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "kegiatan": return <Calendar className="h-5 w-5 text-green-500" />;
      case "info": return <Info className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTipeColor = (tipe: string) => {
    switch (tipe) {
      case "akademik": return "bg-blue-100 text-blue-800";
      case "peringatan": return "bg-orange-100 text-orange-800";
      case "kegiatan": return "bg-green-100 text-green-800";
      case "info": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifikasi</h2>
          <p className="text-sm text-gray-500 mt-1">Informasi &gt; Notifikasi</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Tandai Semua Sudah Dibaca ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "semua" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("semua")}
        >
          Semua ({data.length})
        </Button>
        <Button
          variant={filter === "belum" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("belum")}
        >
          Belum Dibaca ({unreadCount})
        </Button>
        <Button
          variant={filter === "sudah" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("sudah")}
        >
          Sudah Dibaca ({data.length - unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada notifikasi</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`transition-colors ${!item.dibaca ? "border-blue-200 bg-blue-50/50" : ""}`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getIcon(item.tipe)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-semibold ${!item.dibaca ? "text-gray-900" : "text-gray-700"}`}>
                          {item.judul}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{item.pesan}</p>
                      </div>
                      <Badge className={getTipeColor(item.tipe)}>{item.tipe}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{item.waktu}</span>
                      {!item.dibaca && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(item.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Tandai Dibaca
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
