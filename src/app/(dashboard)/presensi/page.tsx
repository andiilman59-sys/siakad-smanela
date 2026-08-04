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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface PresensiSiswa {
  id: string;
  nisn: string;
  nama: string;
  status: string;
}

const siswaList: PresensiSiswa[] = [
  { id: "1", nisn: "0051234001", nama: "Ahmad Rizki Pratama", status: "Hadir" },
  { id: "2", nisn: "0051234002", nama: "Siti Nurhaliza", status: "Hadir" },
  { id: "3", nisn: "0051234003", nama: "Budi Santoso", status: "Sakit" },
  { id: "4", nisn: "0051234004", nama: "Dewi Anggraini", status: "Hadir" },
  { id: "5", nisn: "0051234005", nama: "Farhan Maulana", status: "Izin" },
  { id: "6", nisn: "0051234006", nama: "Gita Puspita Sari", status: "Hadir" },
  { id: "7", nisn: "0051234007", nama: "Hendra Wijaya", status: "Alpa" },
  { id: "8", nisn: "0051234008", nama: "Indah Permata", status: "Hadir" },
  { id: "9", nisn: "0051234009", nama: "Joko Prasetyo", status: "Terlambat" },
  { id: "10", nisn: "0051234010", nama: "Kartika Dewi Lestari", status: "Hadir" },
];

const statusOptions = ["Hadir", "Sakit", "Izin", "Alpa", "Terlambat"];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Hadir: { color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-4 w-4" /> },
  Sakit: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <AlertTriangle className="h-4 w-4" /> },
  Izin: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Clock className="h-4 w-4" /> },
  Alpa: { color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="h-4 w-4" /> },
  Terlambat: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: <Clock className="h-4 w-4" /> },
};

const kelasList = ["X-A", "X-B", "XI-A", "XI-B", "XII-A", "XII-B"];

export default function PresensiPage() {
  const [selectedKelas, setSelectedKelas] = useState("X-A");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [presensi, setPresensi] = useState<PresensiSiswa[]>(siswaList);
  const [saved, setSaved] = useState(false);

  const updateStatus = (id: string, status: string) => {
    setPresensi((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stats = {
    hadir: presensi.filter((p) => p.status === "Hadir").length,
    sakit: presensi.filter((p) => p.status === "Sakit").length,
    izin: presensi.filter((p) => p.status === "Izin").length,
    alpa: presensi.filter((p) => p.status === "Alpa").length,
    terlambat: presensi.filter((p) => p.status === "Terlambat").length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Presensi Siswa</h2>
        <p className="text-sm text-gray-500 mt-1">Presensi &gt; Rekap Kehadiran</p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full sm:w-52" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {saved ? "Tersimpan!" : "Simpan Presensi"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
            <p className="text-sm text-gray-500">Hadir</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.sakit}</div>
            <p className="text-sm text-gray-500">Sakit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.izin}</div>
            <p className="text-sm text-gray-500">Izin</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.alpa}</div>
            <p className="text-sm text-gray-500">Alpa</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.terlambat}</div>
            <p className="text-sm text-gray-500">Terlambat</p>
          </CardContent>
        </Card>
      </div>

      {/* Presensi Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daftar Presensi - Kelas {selectedKelas}
          </CardTitle>
          <CardDescription>{formatDate(selectedDate)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead className="text-center">Status Kehadiran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presensi.map((siswa, idx) => {
                  const config = statusConfig[siswa.status];
                  return (
                    <TableRow key={siswa.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{siswa.nisn}</TableCell>
                      <TableCell className="font-medium">{siswa.nama}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {statusOptions.map((status) => {
                            const isActive = siswa.status === status;
                            const cfg = statusConfig[status];
                            return (
                              <Button
                                key={status}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                className={`${isActive ? cfg.color : ""} border`}
                                onClick={() => updateStatus(siswa.id, status)}
                              >
                                {cfg.icon}
                                <span className="ml-1">{status}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
