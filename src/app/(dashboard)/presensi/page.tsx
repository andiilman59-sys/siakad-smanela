"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getPresensi, savePresensi } from "@/lib/actions/presensi";
import { getKelas } from "@/lib/actions/kelas";
import type { Class, Student, Attendance, AttendanceStatus } from "@/types/database";
import { Save, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const statusOptions: AttendanceStatus[] = ["hadir", "sakit", "izin", "alpa", "terlambat"];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  hadir: { label: "Hadir", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-4 w-4" /> },
  sakit: { label: "Sakit", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <AlertTriangle className="h-4 w-4" /> },
  izin: { label: "Izin", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Clock className="h-4 w-4" /> },
  alpa: { label: "Alpa", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="h-4 w-4" /> },
  terlambat: { label: "Terlambat", color: "bg-orange-100 text-orange-800 border-orange-200", icon: <Clock className="h-4 w-4" /> },
};

interface StudentWithAttendance {
  student_id: string;
  full_name: string;
  nisn: string;
  status: AttendanceStatus;
  notes: string;
}

export default function PresensiPage() {
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [presensi, setPresensi] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kelasList, setKelasList] = useState<Class[]>([]);

  const loadKelas = useCallback(async () => {
    const result = await getKelas();
    if (result.success && result.data) setKelasList(result.data);
  }, []);

  useEffect(() => {
    loadKelas();
  }, [loadKelas]);

  const loadPresensi = useCallback(async () => {
    if (!selectedClassId || !selectedDate) return;
    setLoading(true);

    const result = await getPresensi(selectedClassId, selectedDate);
    if (result.success && result.data) {
      const mapped: StudentWithAttendance[] = result.data.map((a) => ({
        student_id: a.student_id,
        full_name: a.student_id,
        nisn: "",
        status: a.status,
        notes: a.notes || "",
      }));
      setPresensi(mapped);
    } else {
      setPresensi([]);
    }
    setLoading(false);
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    if (selectedClassId && selectedDate) {
      loadPresensi();
    }
  }, [selectedClassId, selectedDate, loadPresensi]);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setPresensi((prev) =>
      prev.map((p) => (p.student_id === studentId ? { ...p, status } : p))
    );
  };

  const updateNotes = (studentId: string, notes: string) => {
    setPresensi((prev) =>
      prev.map((p) => (p.student_id === studentId ? { ...p, notes } : p))
    );
  };

  const handleSave = async () => {
    if (!selectedClassId || !selectedDate || presensi.length === 0) return;
    setSaving(true);

    const records = presensi.map((p) => ({
      student_id: p.student_id,
      schedule_id: selectedClassId,
      date: selectedDate,
      status: p.status,
      notes: p.notes,
    }));

    const result = await savePresensi(records);
    if (result.success) {
      toast({ title: "Berhasil", description: "Data presensi berhasil disimpan" });
    } else {
      toast({ title: "Gagal", description: result.error || "Gagal menyimpan presensi", variant: "destructive" });
    }
    setSaving(false);
  };

  const stats = {
    hadir: presensi.filter((p) => p.status === "hadir").length,
    sakit: presensi.filter((p) => p.status === "sakit").length,
    izin: presensi.filter((p) => p.status === "izin").length,
    alpa: presensi.filter((p) => p.status === "alpa").length,
    terlambat: presensi.filter((p) => p.status === "terlambat").length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const selectedClassName = kelasList.find((k) => k.id === selectedClassId)?.name || "Pilih Kelas";

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
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full sm:w-52" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave} disabled={saving || !selectedClassId || presensi.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Menyimpan..." : "Simpan Presensi"}
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
            Daftar Presensi - Kelas {selectedClassName}
          </CardTitle>
          <CardDescription>{selectedDate ? formatDate(selectedDate) : "Pilih tanggal"}</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedClassId ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Pilih kelas terlebih dahulu untuk mengisi presensi</p>
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : presensi.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada data presensi untuk tanggal ini</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="text-center">Status Kehadiran</TableHead>
                    <TableHead className="w-48">Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presensi.map((siswa, idx) => {
                    const cfg = statusConfig[siswa.status];
                    return (
                      <TableRow key={siswa.student_id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{siswa.full_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {statusOptions.map((status) => {
                              const isActive = siswa.status === status;
                              const sCfg = statusConfig[status];
                              return (
                                <Button
                                  key={status}
                                  variant={isActive ? "default" : "outline"}
                                  size="sm"
                                  className={`${isActive ? sCfg.color : ""} border`}
                                  onClick={() => updateStatus(siswa.student_id, status)}
                                >
                                  {sCfg.icon}
                                  <span className="ml-1">{sCfg.label}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Catatan..."
                            value={siswa.notes}
                            onChange={(e) => updateNotes(siswa.student_id, e.target.value)}
                            className="text-sm"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
