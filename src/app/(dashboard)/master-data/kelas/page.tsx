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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Kelas {
  id: string;
  nama: string;
  tingkat: string;
  waliKelas: string;
  tahunAjaran: string;
  jumlahSiswa: number;
  status: string;
}

const initialData: Kelas[] = [
  { id: "1", nama: "X-A", tingkat: "10", waliKelas: "Drs. H. Ahmad Fauzi, M.Pd", tahunAjaran: "2025/2026", jumlahSiswa: 32, status: "Aktif" },
  { id: "2", nama: "X-B", tingkat: "10", waliKelas: "Siti Aminah, S.Pd", tahunAjaran: "2025/2026", jumlahSiswa: 30, status: "Aktif" },
  { id: "3", nama: "XI-A", tingkat: "11", waliKelas: "Budi Hartono, S.Kom", tahunAjaran: "2025/2026", jumlahSiswa: 31, status: "Aktif" },
  { id: "4", nama: "XI-B", tingkat: "11", waliKelas: "Dewi Kartika, S.Pd", tahunAjaran: "2025/2026", jumlahSiswa: 29, status: "Aktif" },
  { id: "5", nama: "XII-A", tingkat: "12", waliKelas: "Hendra Gunawan, S.Si", tahunAjaran: "2025/2026", jumlahSiswa: 28, status: "Aktif" },
  { id: "6", nama: "XII-B", tingkat: "12", waliKelas: "Rina Susanti, S.Pd.I", tahunAjaran: "2025/2026", jumlahSiswa: 30, status: "Aktif" },
  { id: "7", nama: "X-C", tingkat: "10", waliKelas: "Agus Setiawan, S.Pd", tahunAjaran: "2024/2025", jumlahSiswa: 0, status: "Nonaktif" },
  { id: "8", nama: "XI-C", tingkat: "11", waliKelas: "Maya Sari, S.Pd", tahunAjaran: "2024/2025", jumlahSiswa: 0, status: "Nonaktif" },
];

const emptyForm: Omit<Kelas, "id" | "jumlahSiswa"> = {
  nama: "",
  tingkat: "",
  waliKelas: "",
  tahunAjaran: "",
  status: "Aktif",
};

const ITEMS_PER_PAGE = 7;

export default function KelasPage() {
  const [data, setData] = useState<Kelas[]>(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Kelas | null>(null);

  const guruList = [
    "Drs. H. Ahmad Fauzi, M.Pd",
    "Siti Aminah, S.Pd",
    "Budi Hartono, S.Kom",
    "Dewi Kartika, S.Pd",
    "Hendra Gunawan, S.Si",
    "Rina Susanti, S.Pd.I",
    "Agus Setiawan, S.Pd",
    "Maya Sari, S.Pd",
  ];

  const filtered = data.filter(
    (d) =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.waliKelas.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nama) errs.nama = "Nama kelas wajib diisi";
    if (!form.tingkat) errs.tingkat = "Tingkat wajib dipilih";
    if (!form.waliKelas) errs.waliKelas = "Wali kelas wajib dipilih";
    if (!form.tahunAjaran) errs.tahunAjaran = "Tahun ajaran wajib dipilih";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      setData((prev) => prev.map((d) => (d.id === editingId ? { ...d, ...form } : d)));
    } else {
      setData((prev) => [...prev, { ...form, id: String(Date.now()), jumlahSiswa: 0 }]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (kelas: Kelas) => {
    setForm({ nama: kelas.nama, tingkat: kelas.tingkat, waliKelas: kelas.waliKelas, tahunAjaran: kelas.tahunAjaran, status: kelas.status });
    setEditingId(kelas.id);
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

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Kelas</h2>
        <p className="text-sm text-gray-500 mt-1">Master Data &gt; Kelas</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Daftar Kelas</CardTitle>
              <CardDescription>Total {filtered.length} kelas terdaftar</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cari nama kelas..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 w-full sm:w-64" />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kelas
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
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                  <TableHead>Tahun Ajaran</TableHead>
                  <TableHead className="text-center">Jumlah Siswa</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">Tidak ada data ditemukan</TableCell>
                  </TableRow>
                ) : (
                  paginated.map((kelas, idx) => (
                    <TableRow key={kelas.id}>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{kelas.nama}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Tingkat {kelas.tingkat}</Badge>
                      </TableCell>
                      <TableCell>{kelas.waliKelas}</TableCell>
                      <TableCell>{kelas.tahunAjaran}</TableCell>
                      <TableCell className="text-center">{kelas.jumlahSiswa}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(kelas)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(kelas); setDeleteDialogOpen(true); }}>
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
            <DialogTitle>{editingId ? "Edit Kelas" : "Tambah Kelas"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data kelas yang dipilih" : "Isi data kelas baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nama Kelas *</Label>
              <Input value={form.nama} onChange={(e) => setField("nama", e.target.value)} placeholder="Contoh: X-A" />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tingkat *</Label>
              <Select value={form.tingkat} onValueChange={(v) => setField("tingkat", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih tingkat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 (X)</SelectItem>
                  <SelectItem value="11">11 (XI)</SelectItem>
                  <SelectItem value="12">12 (XII)</SelectItem>
                </SelectContent>
              </Select>
              {errors.tingkat && <p className="text-sm text-red-500">{errors.tingkat}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Wali Kelas *</Label>
              <Select value={form.waliKelas} onValueChange={(v) => setField("waliKelas", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih wali kelas" /></SelectTrigger>
                <SelectContent>
                  {guruList.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.waliKelas && <p className="text-sm text-red-500">{errors.waliKelas}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tahun Ajaran *</Label>
              <Select value={form.tahunAjaran} onValueChange={(v) => setField("tahunAjaran", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                </SelectContent>
              </Select>
              {errors.tahunAjaran && <p className="text-sm text-red-500">{errors.tahunAjaran}</p>}
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
            <DialogTitle>Hapus Kelas</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kelas <strong>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
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
