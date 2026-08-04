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
  AlertTriangle,
} from "lucide-react";

interface Pelanggaran {
  id: string;
  tanggal: string;
  siswa: string;
  kategori: string;
  poin: number;
  deskripsi: string;
}

const initialData: Pelanggaran[] = [
  { id: "1", tanggal: "2025-07-21", siswa: "Ahmad Rizki Pratama", kategori: "Keterlambatan", poin: 5, deskripsi: "Terlambat masuk sekolah 15 menit" },
  { id: "2", tanggal: "2025-07-20", siswa: "Budi Santoso", kategori: "Tidak Mengerjakan PR", poin: 10, deskripsi: "Tidak mengerjakan tugas matematika" },
  { id: "3", tanggal: "2025-07-19", siswa: "Farhan Maulana", kategori: "Bolos", poin: 25, deskripsi: "Tidak hadir tanpa keterangan selama 1 hari" },
  { id: "4", tanggal: "2025-07-18", siswa: "Hendra Wijaya", kategori: "Pelanggaran Seragam", poin: 5, deskripsi: "Tidak menggunakan sepatu hitam sesuai ketentuan" },
  { id: "5", tanggal: "2025-07-17", siswa: "Joko Prasetyo", kategori: "Tidak Mengerjakan PR", poin: 10, deskripsi: "Tidak membawa buku pelajaran bahasa Inggris" },
];

const kategoriList = ["Keterlambatan", "Bolos", "Tidak Mengerjakan PR", "Pelanggaran Seragam", "Merokok", "Bullying", "Kerusakan Fasilitas", "Lainnya"];
const poinMap: Record<string, number> = {
  "Keterlambatan": 5,
  "Bolos": 25,
  "Tidak Mengerjakan PR": 10,
  "Pelanggaran Seragam": 5,
  "Merokok": 20,
  "Bullying": 30,
  "Kerusakan Fasilitas": 15,
  "Lainnya": 5,
};
const siswaNamaList = [
  "Ahmad Rizki Pratama", "Siti Nurhaliza", "Budi Santoso", "Dewi Anggraini",
  "Farhan Maulana", "Gita Puspita Sari", "Hendra Wijaya", "Indah Permata",
  "Joko Prasetyo", "Kartika Dewi Lestari",
];

const emptyForm: Omit<Pelanggaran, "id"> = {
  tanggal: new Date().toISOString().split("T")[0],
  siswa: "",
  kategori: "",
  poin: 0,
  deskripsi: "",
};

export default function KedisiplinanPage() {
  const [data, setData] = useState<Pelanggaran[]>(initialData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Pelanggaran | null>(null);

  const filtered = data.filter(
    (d) =>
      d.siswa.toLowerCase().includes(search.toLowerCase()) ||
      d.kategori.toLowerCase().includes(search.toLowerCase())
  );

  const totalPoin = data.reduce((sum, d) => sum + d.poin, 0);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.tanggal) errs.tanggal = "Tanggal wajib diisi";
    if (!form.siswa) errs.siswa = "Siswa wajib dipilih";
    if (!form.kategori) errs.kategori = "Kategori wajib dipilih";
    if (!form.deskripsi) errs.deskripsi = "Deskripsi wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const poin = poinMap[form.kategori] || 5;
    const formData = { ...form, poin };
    if (editingId) {
      setData((prev) => prev.map((d) => (d.id === editingId ? { ...d, ...formData } : d)));
    } else {
      setData((prev) => [...prev, { ...formData, id: String(Date.now()) }]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (item: Pelanggaran) => {
    setForm({ tanggal: item.tanggal, siswa: item.siswa, kategori: item.kategori, poin: item.poin, deskripsi: item.deskripsi });
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
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setDialogOpen(true);
  };

  const setField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "kategori" && typeof value === "string") {
      setForm((prev) => ({ ...prev, poin: poinMap[value] || 5 }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const getPoinBadge = (poin: number) => {
    if (poin >= 25) return "destructive";
    if (poin >= 10) return "secondary";
    return "outline";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kedisiplinan</h2>
        <p className="text-sm text-gray-500 mt-1">Kedisiplinan &gt; Pelanggaran Siswa</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-sm text-gray-500">Total Pelanggaran</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-600">{totalPoin}</div>
            <p className="text-sm text-gray-500">Total Poin Pelanggaran</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(data.map((d) => d.siswa)).size}
            </div>
            <p className="text-sm text-gray-500">Siswa Melanggar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Daftar Pelanggaran</CardTitle>
              <CardDescription>Riwayat pelanggaran kedisiplinan siswa</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cari siswa atau kategori..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-full sm:w-64" />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggaran
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
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Poin</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">Tidak ada data ditemukan</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="text-sm">{formatDate(item.tanggal)}</TableCell>
                      <TableCell className="font-medium">{item.siswa}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.kategori}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getPoinBadge(item.poin)}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {item.poin}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">{item.deskripsi}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(item); setDeleteDialogOpen(true); }}>
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
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pelanggaran" : "Tambah Pelanggaran"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data pelanggaran" : "Catat pelanggaran siswa baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Tanggal *</Label>
              <Input type="date" value={form.tanggal} onChange={(e) => setField("tanggal", e.target.value)} />
              {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
            </div>
            <div className="space-y-2">
              <Label>Siswa *</Label>
              <Select value={form.siswa} onValueChange={(v) => setField("siswa", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                <SelectContent>
                  {siswaNamaList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.siswa && <p className="text-sm text-red-500">{errors.siswa}</p>}
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select value={form.kategori} onValueChange={(v) => setField("kategori", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {kategoriList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.kategori && <p className="text-sm text-red-500">{errors.kategori}</p>}
            </div>
            <div className="space-y-2">
              <Label>Poin</Label>
              <Input type="number" value={form.poin} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Deskripsi *</Label>
              <Textarea value={form.deskripsi} onChange={(e) => setField("deskripsi", e.target.value)} placeholder="Jelaskan pelanggaran..." />
              {errors.deskripsi && <p className="text-sm text-red-500">{errors.deskripsi}</p>}
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
            <DialogTitle>Hapus Pelanggaran</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus data pelanggaran ini?</DialogDescription>
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
