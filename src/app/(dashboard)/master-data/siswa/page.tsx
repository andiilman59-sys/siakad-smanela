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

interface Siswa {
  id: string;
  nisn: string;
  nis: string;
  nama: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  email: string;
  kelas: string;
  status: string;
}

const initialData: Siswa[] = [
  { id: "1", nisn: "0051234001", nis: "2024001", nama: "Ahmad Rizki Pratama", jenisKelamin: "L", tempatLahir: "Jakarta", tanggalLahir: "2008-03-15", alamat: "Jl. Merdeka No. 10, Jakarta Selatan", noHp: "081234567890", email: "ahmad.rizki@email.com", kelas: "X-A", status: "Aktif" },
  { id: "2", nisn: "0051234002", nis: "2024002", nama: "Siti Nurhaliza", jenisKelamin: "P", tempatLahir: "Bandung", tanggalLahir: "2008-07-22", alamat: "Jl. Asia Afrika No. 25, Bandung", noHp: "081234567891", email: "siti.nurhaliza@email.com", kelas: "X-A", status: "Aktif" },
  { id: "3", nisn: "0051234003", nis: "2024003", nama: "Budi Santoso", jenisKelamin: "L", tempatLahir: "Surabaya", tanggalLahir: "2008-01-10", alamat: "Jl. Pemuda No. 40, Surabaya", noHp: "081234567892", email: "budi.santoso@email.com", kelas: "X-B", status: "Aktif" },
  { id: "4", nisn: "0051234004", nis: "2024004", nama: "Dewi Anggraini", jenisKelamin: "P", tempatLahir: "Yogyakarta", tanggalLahir: "2008-11-05", alamat: "Jl. Malioboro No. 15, Yogyakarta", noHp: "081234567893", email: "dewi.anggraini@email.com", kelas: "X-B", status: "Aktif" },
  { id: "5", nisn: "0051234005", nis: "2024005", nama: "Farhan Maulana", jenisKelamin: "L", tempatLahir: "Semarang", tanggalLahir: "2008-05-18", alamat: "Jl. Pandanaran No. 30, Semarang", noHp: "081234567894", email: "farhan.maulana@email.com", kelas: "XI-A", status: "Aktif" },
  { id: "6", nisn: "0051234006", nis: "2024006", nama: "Gita Puspita Sari", jenisKelamin: "P", tempatLahir: "Malang", tanggalLahir: "2007-09-12", alamat: "Jl. Ijen No. 20, Malang", noHp: "081234567895", email: "gita.puspita@email.com", kelas: "XI-A", status: "Aktif" },
  { id: "7", nisn: "0051234007", nis: "2024007", nama: "Hendra Wijaya", jenisKelamin: "L", tempatLahir: "Medan", tanggalLahir: "2007-04-28", alamat: "Jl. Pemuda No. 55, Medan", noHp: "081234567896", email: "hendra.wijaya@email.com", kelas: "XI-B", status: "Aktif" },
  { id: "8", nisn: "0051234008", nis: "2024008", nama: "Indah Permata", jenisKelamin: "P", tempatLahir: "Makassar", tanggalLahir: "2007-08-30", alamat: "Jl. Pettarani No. 12, Makassar", noHp: "081234567897", email: "indah.permata@email.com", kelas: "XI-B", status: "Aktif" },
  { id: "9", nisn: "0051234009", nis: "2024009", nama: "Joko Prasetyo", jenisKelamin: "L", tempatLahir: "Solo", tanggalLahir: "2007-02-14", alamat: "Jl. Slamet Riyadi No. 35, Solo", noHp: "081234567898", email: "joko.prasetyo@email.com", kelas: "XII-A", status: "Aktif" },
  { id: "10", nisn: "0051234010", nis: "2024010", nama: "Kartika Dewi Lestari", jenisKelamin: "P", tempatLahir: "Palembang", tanggalLahir: "2007-06-21", alamat: "Jl. Merdeka No. 48, Palembang", noHp: "081234567899", email: "kartika.dewi@email.com", kelas: "XII-A", status: "Aktif" },
];

const emptyForm: Omit<Siswa, "id"> = {
  nisn: "",
  nis: "",
  nama: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  noHp: "",
  email: "",
  kelas: "",
  status: "Aktif",
};

const ITEMS_PER_PAGE = 7;

export default function SiswaPage() {
  const [data, setData] = useState<Siswa[]>(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Siswa | null>(null);

  const filtered = data.filter(
    (d) =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.nisn.includes(search) ||
      d.nis.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nisn) errs.nisn = "NISN wajib diisi";
    if (!form.nis) errs.nis = "NIS wajib diisi";
    if (!form.nama) errs.nama = "Nama wajib diisi";
    if (!form.jenisKelamin) errs.jenisKelamin = "Jenis kelamin wajib dipilih";
    if (!form.kelas) errs.kelas = "Kelas wajib dipilih";
    if (!form.status) errs.status = "Status wajib dipilih";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      setData((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, ...form } : d))
      );
    } else {
      setData((prev) => [
        ...prev,
        { ...form, id: String(Date.now()) },
      ]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (siswa: Siswa) => {
    setForm({
      nisn: siswa.nisn,
      nis: siswa.nis,
      nama: siswa.nama,
      jenisKelamin: siswa.jenisKelamin,
      tempatLahir: siswa.tempatLahir,
      tanggalLahir: siswa.tanggalLahir,
      alamat: siswa.alamat,
      noHp: siswa.noHp,
      email: siswa.email,
      kelas: siswa.kelas,
      status: siswa.status,
    });
    setEditingId(siswa.id);
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
        <h2 className="text-2xl font-bold text-gray-900">Data Siswa</h2>
        <p className="text-sm text-gray-500 mt-1">
          Master Data &gt; Siswa
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Daftar Siswa</CardTitle>
              <CardDescription>
                Total {filtered.length} siswa terdaftar
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama atau NISN..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Siswa
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
                  <TableHead>NISN</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((siswa, idx) => (
                    <TableRow key={siswa.id}>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{siswa.nisn}</TableCell>
                      <TableCell className="font-mono text-sm">{siswa.nis}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{siswa.nama}</div>
                          <div className="text-xs text-gray-500">{siswa.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{siswa.kelas}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={siswa.status === "Aktif" ? "default" : "secondary"}>
                          {siswa.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(siswa)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-600"
                            onClick={() => {
                              setDeleteTarget(siswa);
                              setDeleteDialogOpen(true);
                            }}
                          >
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Ubah data siswa yang dipilih" : "Isi data siswa baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>NISN *</Label>
              <Input value={form.nisn} onChange={(e) => setField("nisn", e.target.value)} placeholder="Masukkan NISN" />
              {errors.nisn && <p className="text-sm text-red-500">{errors.nisn}</p>}
            </div>
            <div className="space-y-2">
              <Label>NIS *</Label>
              <Input value={form.nis} onChange={(e) => setField("nis", e.target.value)} placeholder="Masukkan NIS" />
              {errors.nis && <p className="text-sm text-red-500">{errors.nis}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input value={form.nama} onChange={(e) => setField("nama", e.target.value)} placeholder="Masukkan nama lengkap" />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jenis Kelamin *</Label>
              <Select value={form.jenisKelamin} onValueChange={(v) => setField("jenisKelamin", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {errors.jenisKelamin && <p className="text-sm text-red-500">{errors.jenisKelamin}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tempat Lahir</Label>
              <Input value={form.tempatLahir} onChange={(e) => setField("tempatLahir", e.target.value)} placeholder="Masukkan tempat lahir" />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input type="date" value={form.tanggalLahir} onChange={(e) => setField("tanggalLahir", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Alamat</Label>
              <Textarea value={form.alamat} onChange={(e) => setField("alamat", e.target.value)} placeholder="Masukkan alamat lengkap" />
            </div>
            <div className="space-y-2">
              <Label>No HP</Label>
              <Input value={form.noHp} onChange={(e) => setField("noHp", e.target.value)} placeholder="Masukkan nomor HP" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="Masukkan email" />
            </div>
            <div className="space-y-2">
              <Label>Kelas *</Label>
              <Select value={form.kelas} onValueChange={(v) => setField("kelas", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {["X-A", "X-B", "X-C", "XI-A", "XI-B", "XI-C", "XII-A", "XII-B", "XII-C"].map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kelas && <p className="text-sm text-red-500">{errors.kelas}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  <SelectItem value="Lulus">Lulus</SelectItem>
                  <SelectItem value="Keluar">Keluar</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editingId ? "Simpan Perubahan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Siswa</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data <strong>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
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
