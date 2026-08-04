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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getJadwal, createJadwal, deleteJadwal, checkJadwalBentrok } from "@/lib/actions/jadwal";
import { getKelas } from "@/lib/actions/kelas";
import { getMapel } from "@/lib/actions/mapel";
import { getGuru } from "@/lib/actions/guru";
import { getTahunAjaran } from "@/lib/actions/tahun-ajaran";
import type { Schedule, Class, Subject, Teacher, AcademicYear, Semester } from "@/types/database";
import { Plus, Trash2, Calendar, AlertTriangle } from "lucide-react";

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const dayMap: Record<string, number> = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6 };
const jamSlots = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

const emptyForm = {
  class_id: "",
  subject_id: "",
  teacher_id: "",
  day_of_week: "",
  start_time: "",
  end_time: "",
  room: "",
};

export default function JadwalPage() {
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [jadwal, setJadwal] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [bentrokWarning, setBentrokWarning] = useState<string | null>(null);

  const [kelasList, setKelasList] = useState<Class[]>([]);
  const [mapelList, setMapelList] = useState<Subject[]>([]);
  const [guruList, setGuruList] = useState<Teacher[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<AcademicYear[]>([]);

  const loadForeignData = useCallback(async () => {
    const [kRes, mRes, gRes, taRes] = await Promise.all([
      getKelas(),
      getMapel(),
      getGuru(),
      getTahunAjaran(),
    ]);
    if (kRes.success && kRes.data) setKelasList(kRes.data);
    if (mRes.success && mRes.data) setMapelList(mRes.data);
    if (gRes.success && gRes.data) setGuruList(gRes.data);
    if (taRes.success && taRes.data) setTahunAjaranList(taRes.data);
  }, []);

  const loadJadwal = useCallback(async (classId: string) => {
    if (!classId) {
      setJadwal([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getJadwal(classId);
    if (result.success && result.data) {
      setJadwal(result.data);
    } else {
      setJadwal([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadForeignData();
  }, [loadForeignData]);

  useEffect(() => {
    if (selectedClassId) {
      loadJadwal(selectedClassId);
    }
  }, [selectedClassId, loadJadwal]);

  const getScheduleCell = (day: string, time: string): Schedule | undefined => {
    const dayNum = dayMap[day];
    return jadwal.find(
      (j) =>
        j.day_of_week === dayNum &&
        j.start_time <= time &&
        j.end_time > time
    );
  };

  const getSubjectName = (id: string) => mapelList.find((m) => m.id === id)?.name || "-";
  const getTeacherName = (id: string) => guruList.find((g) => g.id === id)?.full_name || "-";
  const getClassName = (id: string) => kelasList.find((k) => k.id === id)?.name || "-";

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.class_id) errs.class_id = "Kelas wajib dipilih";
    if (!form.subject_id) errs.subject_id = "Mata pelajaran wajib dipilih";
    if (!form.teacher_id) errs.teacher_id = "Guru wajib dipilih";
    if (!form.day_of_week) errs.day_of_week = "Hari wajib dipilih";
    if (!form.start_time) errs.start_time = "Jam mulai wajib diisi";
    if (!form.end_time) errs.end_time = "Jam selesai wajib diisi";
    if (!form.room) errs.room = "Ruang wajib diisi";
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      errs.end_time = "Jam selesai harus lebih besar dari jam mulai";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setBentrokWarning(null);

    const activeYear = tahunAjaranList.find((ta) => ta.is_active);
    const semester: Semester = "ganjil";

    if (activeYear) {
      const bentrokCheck = await checkJadwalBentrok({
        class_id: form.class_id,
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        semester,
        academic_year_id: activeYear.id,
      });

      if (bentrokCheck.success && bentrokCheck.data?.bentrok) {
        setBentrokWarning("Jadwal bentrok dengan jadwal yang sudah ada pada hari dan jam yang sama!");
        setSaving(false);
        return;
      }
    }

    const payload = {
      class_id: form.class_id,
      subject_id: form.subject_id,
      teacher_id: form.teacher_id,
      day_of_week: Number(form.day_of_week),
      start_time: form.start_time,
      end_time: form.end_time,
      room: form.room,
      academic_year_id: activeYear?.id || "",
      semester,
    };

    const result = await createJadwal(payload);
    if (result.success) {
      toast({ title: "Berhasil", description: "Jadwal berhasil ditambahkan" });
      setDialogOpen(false);
      setForm(emptyForm);
      setBentrokWarning(null);
      loadJadwal(selectedClassId);
    } else {
      toast({ title: "Gagal", description: result.error || "Terjadi kesalahan", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteJadwal(deleteTarget.id);
    if (result.success) {
      toast({ title: "Berhasil", description: "Jadwal berhasil dihapus" });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      loadJadwal(selectedClassId);
    } else {
      toast({ title: "Gagal", description: result.error || "Gagal menghapus jadwal", variant: "destructive" });
    }
    setDeleting(false);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, class_id: selectedClassId });
    setErrors({});
    setBentrokWarning(null);
    setDialogOpen(true);
  };

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "day_of_week" || field === "start_time" || field === "end_time") {
      setBentrokWarning(null);
    }
  };

  const selectedClassName = kelasList.find((k) => k.id === selectedClassId)?.name || "Pilih Kelas";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Jadwal Pelajaran</h2>
        <p className="text-sm text-gray-500 mt-1">Jadwal &gt; Jadwal Pelajaran</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Jadwal Kelas {selectedClassName}</CardTitle>
              <CardDescription>Lihat dan kelola jadwal pelajaran</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
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
              <Button onClick={openAdd} disabled={!selectedClassId}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Jadwal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedClassId ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Pilih kelas terlebih dahulu untuk melihat jadwal</p>
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : jadwal.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada jadwal untuk kelas ini</p>
              <Button variant="outline" className="mt-4" onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Jadwal
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Jam</TableHead>
                    {days.map((day) => (
                      <TableHead key={day} className="text-center min-w-[150px]">{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jamSlots.map((time) => (
                    <TableRow key={time}>
                      <TableCell className="font-mono text-xs">{time}:00</TableCell>
                      {days.map((day) => {
                        const item = getScheduleCell(day, time);
                        return (
                          <TableCell key={day} className="text-center">
                            {item ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs">
                                <div className="font-medium text-blue-800">{getSubjectName(item.subject_id)}</div>
                                <div className="text-blue-600 truncate">{getTeacherName(item.teacher_id)}</div>
                                <div className="text-blue-500">{item.room || "-"}</div>
                                <div className="flex justify-center mt-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-red-600 hover:text-red-600"
                                    onClick={() => { setDeleteTarget(item); setDeleteDialogOpen(true); }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Jadwal</DialogTitle>
            <DialogDescription>Isi data jadwal baru</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Kelas *</Label>
              <Select value={form.class_id} onValueChange={(v) => setField("class_id", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.class_id && <p className="text-sm text-red-500">{errors.class_id}</p>}
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran *</Label>
              <Select value={form.subject_id} onValueChange={(v) => setField("subject_id", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                <SelectContent>
                  {mapelList.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.subject_id && <p className="text-sm text-red-500">{errors.subject_id}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Guru *</Label>
              <Select value={form.teacher_id} onValueChange={(v) => setField("teacher_id", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                <SelectContent>
                  {guruList.map((g) => <SelectItem key={g.id} value={g.id}>{g.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.teacher_id && <p className="text-sm text-red-500">{errors.teacher_id}</p>}
            </div>
            <div className="space-y-2">
              <Label>Hari *</Label>
              <Select value={form.day_of_week} onValueChange={(v) => setField("day_of_week", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih hari" /></SelectTrigger>
                <SelectContent>
                  {days.map((d, i) => <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.day_of_week && <p className="text-sm text-red-500">{errors.day_of_week}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ruang *</Label>
              <Input value={form.room} onChange={(e) => setField("room", e.target.value)} placeholder="Contoh: R.101" />
              {errors.room && <p className="text-sm text-red-500">{errors.room}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jam Mulai *</Label>
              <Input type="time" value={form.start_time} onChange={(e) => setField("start_time", e.target.value)} />
              {errors.start_time && <p className="text-sm text-red-500">{errors.start_time}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jam Selesai *</Label>
              <Input type="time" value={form.end_time} onChange={(e) => setField("end_time", e.target.value)} />
              {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
            </div>
          </div>
          {bentrokWarning && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md p-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p>{bentrokWarning}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setBentrokWarning(null); }}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Jadwal</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus jadwal ini?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
