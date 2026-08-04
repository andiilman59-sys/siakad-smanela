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
import { Plus, Pencil, Trash2 } from "lucide-react";

interface JadwalItem {
  id: string;
  kelas: string;
  mapel: string;
  guru: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruang: string;
}

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const jamSlots = ["07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00", "14:00-15:00"];

const mockJadwal: JadwalItem[] = [
  { id: "1", kelas: "X-A", mapel: "Matematika", guru: "Drs. H. Ahmad Fauzi, M.Pd", hari: "Senin", jamMulai: "07:00", jamSelesai: "08:00", ruang: "R.101" },
  { id: "2", kelas: "X-A", mapel: "Bahasa Indonesia", guru: "Siti Aminah, S.Pd", hari: "Senin", jamMulai: "08:00", jamSelesai: "09:00", ruang: "R.101" },
  { id: "3", kelas: "X-A", mapel: "IPA", guru: "Budi Hartono, S.Kom", hari: "Senin", jamMulai: "09:00", jamSelesai: "10:00", ruang: "Lab IPA" },
  { id: "4", kelas: "X-A", mapel: "Bahasa Inggris", guru: "Dewi Kartika, S.Pd", hari: "Selasa", jamMulai: "07:00", jamSelesai: "08:00", ruang: "R.101" },
  { id: "5", kelas: "X-A", mapel: "PPKN", guru: "Agus Setiawan, S.Pd", hari: "Selasa", jamMulai: "08:00", jamSelesai: "09:00", ruang: "R.101" },
  { id: "6", kelas: "X-A", mapel: "PAI", guru: "Rina Susanti, S.Pd.I", hari: "Rabu", jamMulai: "07:00", jamSelesai: "08:00", ruang: "R.101" },
  { id: "7", kelas: "X-A", mapel: "IPS", guru: "Maya Sari, S.Pd", hari: "Rabu", jamMulai: "08:00", jamSelesai: "09:00", ruang: "R.101" },
  { id: "8", kelas: "X-A", mapel: "Penjaskes", guru: "Hendra Gunawan, S.Si", hari: "Kamis", jamMulai: "07:00", jamSelesai: "08:00", ruang: "Lapangan" },
  { id: "9", kelas: "X-A", mapel: "SBK", guru: "Siti Aminah, S.Pd", hari: "Kamis", jamMulai: "08:00", jamSelesai: "09:00", ruang: "R.101" },
  { id: "10", kelas: "X-A", mapel: "Prakarya", guru: "Dewi Kartika, S.Pd", hari: "Jumat", jamMulai: "07:00", jamSelesai: "08:00", ruang: "R.101" },
  { id: "11", kelas: "XI-A", mapel: "Matematika", guru: "Drs. H. Ahmad Fauzi, M.Pd", hari: "Senin", jamMulai: "07:00", jamSelesai: "08:00", ruang: "R.201" },
  { id: "12", kelas: "XI-A", mapel: "Bahasa Indonesia", guru: "Siti Aminah, S.Pd", hari: "Senin", jamMulai: "08:00", jamSelesai: "09:00", ruang: "R.201" },
  { id: "13", kelas: "XI-A", mapel: "IPA", guru: "Budi Hartono, S.Kom", hari: "Selasa", jamMulai: "07:00", jamSelesai: "08:00", ruang: "Lab IPA" },
  { id: "14", kelas: "XI-A", mapel: "Bahasa Inggris", guru: "Dewi Kartika, S.Pd", hari: "Selasa", jamMulai: "08:00", jamSelesai: "09:00", ruang: "R.201" },
  { id: "15", kelas: "XI-A", mapel: "PPKN", guru: "Agus Setiawan, S.Pd", hari: "Rabu", jamMulai: "07:00", jamSelesai: "08:00", ruang: "R.201" },
];

const mapelList = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS", "PPKN", "PAI", "Penjaskes", "SBK", "Prakarya"];
const guruList = [
  "Drs. H. Ahmad Fauzi, M.Pd", "Siti Aminah, S.Pd", "Budi Hartono, S.Kom",
  "Dewi Kartika, S.Pd", "Hendra Gunawan, S.Si", "Rina Susanti, S.Pd.I",
  "Agus Setiawan, S.Pd", "Maya Sari, S.Pd",
];
const kelasList = ["X-A", "X-B", "X-C", "XI-A", "XI-B", "XI-C", "XII-A", "XII-B", "XII-C"];

const emptyForm: Omit<JadwalItem, "id"> = {
  kelas: "", mapel: "", guru: "", hari: "", jamMulai: "", jamSelesai: "", ruang: "",
};

export default function JadwalPage() {
  const [selectedKelas, setSelectedKelas] = useState("X-A");
  const [data, setData] = useState<JadwalItem[]>(mockJadwal);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<JadwalItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filtered = data.filter((d) => d.kelas === selectedKelas);

  const getScheduleCell = (hari: string, jam: string) => {
    const item = filtered.find((d) => d.hari === hari && d.jamMulai <= jam && d.jamSelesai > jam);
    return item;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.kelas) errs.kelas = "Kelas wajib dipilih";
    if (!form.mapel) errs.mapel = "Mapel wajib dipilih";
    if (!form.guru) errs.guru = "Guru wajib dipilih";
    if (!form.hari) errs.hari = "Hari wajib dipilih";
    if (!form.jamMulai) errs.jamMulai = "Jam mulai wajib diisi";
    if (!form.jamSelesai) errs.jamSelesai = "Jam selesai wajib diisi";
    if (!form.ruang) errs.ruang = "Ruang wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      setData((prev) => prev.map((d) => (d.id === editingId ? { ...d, ...form } : d)));
    } else {
      setData((prev) => [...prev, { ...form, id: String(Date.now()) }]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (item: JadwalItem) => {
    setForm({ kelas: item.kelas, mapel: item.mapel, guru: item.guru, hari: item.hari, jamMulai: item.jamMulai, jamSelesai: item.jamSelesai, ruang: item.ruang });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const openAdd = () => {
    setForm({ ...emptyForm, kelas: selectedKelas });
    setEditingId(null);
    setErrors({});
    setDialogOpen(true);
  };

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

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
              <CardTitle className="text-base">Jadwal Kelas {selectedKelas}</CardTitle>
              <CardDescription>Lihat dan kelola jadwal pelajaran</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
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
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Jadwal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Jam</TableHead>
                  {days.map((day) => (
                    <TableHead key={day} className="text-center min-w-[140px]">{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {jamSlots.map((jam) => (
                  <TableRow key={jam}>
                    <TableCell className="font-mono text-xs">{jam}</TableCell>
                    {days.map((day) => {
                      const item = getScheduleCell(day, jam.split("-")[0]);
                      return (
                        <TableCell key={day} className="text-center">
                          {item ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs">
                              <div className="font-medium text-blue-800">{item.mapel}</div>
                              <div className="text-blue-600 truncate">{item.guru.split(",")[0]}</div>
                              <div className="text-blue-500">{item.ruang}</div>
                              <div className="flex justify-center gap-1 mt-1">
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleEdit(item)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(item); setDeleteDialogOpen(true); }}>
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
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data jadwal yang dipilih" : "Isi data jadwal baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Kelas *</Label>
              <Select value={form.kelas} onValueChange={(v) => setField("kelas", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.kelas && <p className="text-sm text-red-500">{errors.kelas}</p>}
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran *</Label>
              <Select value={form.mapel} onValueChange={(v) => setField("mapel", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                <SelectContent>
                  {mapelList.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.mapel && <p className="text-sm text-red-500">{errors.mapel}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Guru *</Label>
              <Select value={form.guru} onValueChange={(v) => setField("guru", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                <SelectContent>
                  {guruList.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.guru && <p className="text-sm text-red-500">{errors.guru}</p>}
            </div>
            <div className="space-y-2">
              <Label>Hari *</Label>
              <Select value={form.hari} onValueChange={(v) => setField("hari", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih hari" /></SelectTrigger>
                <SelectContent>
                  {days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.hari && <p className="text-sm text-red-500">{errors.hari}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ruang *</Label>
              <Input value={form.ruang} onChange={(e) => setField("ruang", e.target.value)} placeholder="Contoh: R.101" />
              {errors.ruang && <p className="text-sm text-red-500">{errors.ruang}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jam Mulai *</Label>
              <Input type="time" value={form.jamMulai} onChange={(e) => setField("jamMulai", e.target.value)} />
              {errors.jamMulai && <p className="text-sm text-red-500">{errors.jamMulai}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jam Selesai *</Label>
              <Input type="time" value={form.jamSelesai} onChange={(e) => setField("jamSelesai", e.target.value)} />
              {errors.jamSelesai && <p className="text-sm text-red-500">{errors.jamSelesai}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editingId ? "Simpan Perubahan" : "Tambah"}</Button>
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
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
