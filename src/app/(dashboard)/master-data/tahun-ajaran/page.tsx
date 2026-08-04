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
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface TahunAjaran {
  id: string;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusAktif: boolean;
}

const initialData: TahunAjaran[] = [
  { id: "1", nama: "2025/2026", tanggalMulai: "2025-07-14", tanggalSelesai: "2026-06-30", statusAktif: true },
  { id: "2", nama: "2024/2025", tanggalMulai: "2024-07-15", tanggalSelesai: "2025-06-30", statusAktif: false },
  { id: "3", nama: "2023/2024", tanggalMulai: "2023-07-17", tanggalSelesai: "2024-06-30", statusAktif: false },
];

const emptyForm: Omit<TahunAjaran, "id"> = {
  nama: "",
  tanggalMulai: "",
  tanggalSelesai: "",
  statusAktif: false,
};

const ITEMS_PER_PAGE = 7;

export default function TahunAjaranPage() {
  const [data, setData] = useState<TahunAjaran[]>(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<TahunAjaran | null>(null);

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nama) errs.nama = "Nama tahun ajaran wajib diisi";
    if (!form.tanggalMulai) errs.tanggalMulai = "Tanggal mulai wajib diisi";
    if (!form.tanggalSelesai) errs.tanggalSelesai = "Tanggal selesai wajib diisi";
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

  const handleEdit = (item: TahunAjaran) => {
    setForm({ nama: item.nama, tanggalMulai: item.tanggalMulai, tanggalSelesai: item.tanggalSelesai, statusAktif: item.statusAktif });
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

  const setField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Tahun Ajaran</h2>
        <p className="text-sm text-gray-500 mt-1">Master Data &gt; Tahun Ajaran</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Daftar Tahun Ajaran</CardTitle>
              <CardDescription>Total {filtered.length} tahun ajaran terdaftar</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cari tahun ajaran..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 w-full sm:w-64" />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Tahun Ajaran
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
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead className="text-center">Status Aktif</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">Tidak ada data ditemukan</TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{formatDate(item.tanggalMulai)}</TableCell>
                      <TableCell>{formatDate(item.tanggalSelesai)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.statusAktif ? "default" : "secondary"}>
                          {item.statusAktif ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
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
            <DialogTitle>{editingId ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data tahun ajaran yang dipilih" : "Isi data tahun ajaran baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nama Tahun Ajaran *</Label>
              <Input value={form.nama} onChange={(e) => setField("nama", e.target.value)} placeholder="Contoh: 2025/2026" />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status Aktif</Label>
              <Select value={form.statusAktif ? "true" : "false"} onValueChange={(v) => setField("statusAktif", v === "true")}>
                <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Mulai *</Label>
              <Input type="date" value={form.tanggalMulai} onChange={(e) => setField("tanggalMulai", e.target.value)} />
              {errors.tanggalMulai && <p className="text-sm text-red-500">{errors.tanggalMulai}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tanggal Selesai *</Label>
              <Input type="date" value={form.tanggalSelesai} onChange={(e) => setField("tanggalSelesai", e.target.value)} />
              {errors.tanggalSelesai && <p className="text-sm text-red-500">{errors.tanggalSelesai}</p>}
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
            <DialogTitle>Hapus Tahun Ajaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tahun ajaran <strong>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
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
