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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Mapel {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  kkm: number;
  tingkat: string;
  semester: string;
  status: string;
}

const initialData: Mapel[] = [
  { id: "1", kode: "MTK", nama: "Matematika", deskripsi: "Mata pelajaran matematika untuk jenjang SMA", kkm: 75, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "2", kode: "BIN", nama: "Bahasa Indonesia", deskripsi: "Mata pelajaran bahasa Indonesia", kkm: 72, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "3", kode: "BIG", nama: "Bahasa Inggris", deskripsi: "Mata pelajaran bahasa Inggris", kkm: 70, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "4", kode: "IPA", nama: "IPA (Fisika, Kimia, Biologi)", deskripsi: "Mata pelajaran ilmu pengetahuan alam", kkm: 72, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "5", kode: "IPS", nama: "IPS (Ekonomi, Sosiologi, Geografi)", deskripsi: "Mata pelajaran ilmu pengetahuan sosial", kkm: 72, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "6", kode: "PKN", nama: "PPKN", deskripsi: "Pendidikan Pancasila dan Kewarganegaraan", kkm: 70, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "7", kode: "PAI", nama: "PAI", deskripsi: "Pendidikan Agama Islam dan Budi Pekerti", kkm: 75, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "8", kode: "PJOK", nama: "Penjaskes", deskripsi: "Pendidikan Jasmani Olahraga dan Kesehatan", kkm: 70, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "9", kode: "SBK", nama: "Seni Budaya dan Keterampilan", deskripsi: "Mata pelajaran seni budaya", kkm: 70, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
  { id: "10", kode: "PRK", nama: "Prakarya", deskripsi: "Mata pelajaran prakarya dan kewirausahaan", kkm: 70, tingkat: "Semua", semester: "Ganjil", status: "Aktif" },
];

const emptyForm: Omit<Mapel, "id"> = {
  kode: "",
  nama: "",
  deskripsi: "",
  kkm: 70,
  tingkat: "Semua",
  semester: "Ganjil",
  status: "Aktif",
};

const ITEMS_PER_PAGE = 7;

export default function MapelPage() {
  const [data, setData] = useState<Mapel[]>(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Mapel | null>(null);

  const filtered = data.filter(
    (d) =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.kode.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.kode) errs.kode = "Kode wajib diisi";
    if (!form.nama) errs.nama = "Nama mapel wajib diisi";
    if (!form.kkm) errs.kkm = "KKM wajib diisi";
    if (!form.tingkat) errs.tingkat = "Tingkat wajib dipilih";
    if (!form.semester) errs.semester = "Semester wajib dipilih";
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

  const handleEdit = (mapel: Mapel) => {
    setForm({ kode: mapel.kode, nama: mapel.nama, deskripsi: mapel.deskripsi, kkm: mapel.kkm, tingkat: mapel.tingkat, semester: mapel.semester, status: mapel.status });
    setEditingId(mapel.id);
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
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setDialogOpen(true);
  };

  const setField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Mata Pelajaran</h2>
        <p className="text-sm text-gray-500 mt-1">Master Data &gt; Mata Pelajaran</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Daftar Mata Pelajaran</CardTitle>
              <CardDescription>Total {filtered.length} mata pelajaran terdaftar</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cari nama atau kode..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 w-full sm:w-64" />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Mapel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Mapel</TableHead>
                  <TableHead className="text-center">KKM</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">Tidak ada data ditemukan</TableCell>
                  </TableRow>
                ) : (
                  paginated.map((mapel, idx) => (
                    <TableRow key={mapel.id}>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell><Badge variant="outline">{mapel.kode}</Badge></TableCell>
                      <TableCell>
                        <div className="font-medium">{mapel.nama}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{mapel.deskripsi}</div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{mapel.kkm}</TableCell>
                      <TableCell>{mapel.semester}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={mapel.status === "Aktif" ? "default" : "secondary"}>{mapel.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(mapel)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(mapel); setDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">Halaman {page} dari {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data mata pelajaran yang dipilih" : "Isi data mata pelajaran baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Kode *</Label>
              <Input value={form.kode} onChange={(e) => setField("kode", e.target.value)} placeholder="Contoh: MTK" />
              {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nama Mapel *</Label>
              <Input value={form.nama} onChange={(e) => setField("nama", e.target.value)} placeholder="Masukkan nama mata pelajaran" />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.deskripsi} onChange={(e) => setField("deskripsi", e.target.value)} placeholder="Masukkan deskripsi mata pelajaran" />
            </div>
            <div className="space-y-2">
              <Label>KKM *</Label>
              <Input type="number" value={form.kkm} onChange={(e) => setField("kkm", Number(e.target.value))} placeholder="Masukkan KKM" />
              {errors.kkm && <p className="text-sm text-red-500">{errors.kkm}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tingkat *</Label>
              <Select value={form.tingkat} onValueChange={(v) => setField("tingkat", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih tingkat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 (X)</SelectItem>
                  <SelectItem value="11">11 (XI)</SelectItem>
                  <SelectItem value="12">12 (XII)</SelectItem>
                  <SelectItem value="Semua">Semua Tingkat</SelectItem>
                </SelectContent>
              </Select>
              {errors.tingkat && <p className="text-sm text-red-500">{errors.tingkat}</p>}
            </div>
            <div className="space-y-2">
              <Label>Semester *</Label>
              <Select value={form.semester} onValueChange={(v) => setField("semester", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
              {errors.semester && <p className="text-sm text-red-500">{errors.semester}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
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
            <DialogTitle>Hapus Mata Pelajaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
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
