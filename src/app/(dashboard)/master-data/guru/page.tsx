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

interface Guru {
  id: string;
  nip: string;
  nuptk: string;
  nama: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  email: string;
  mataPelajaran: string;
  status: string;
}

const initialData: Guru[] = [
  { id: "1", nip: "198501102010011001", nuptk: "547896321000001", nama: "Drs. H. Ahmad Fauzi, M.Pd", jenisKelamin: "L", tempatLahir: "Jakarta", tanggalLahir: "1985-01-10", alamat: "Jl. Kenanga No. 5, Jakarta Pusat", noHp: "081234567800", email: "ahmad.fauzi@smanela.sch.id", mataPelajaran: "Matematika", status: "Aktif" },
  { id: "2", nip: "198705212012012002", nuptk: "678901234000002", nama: "Siti Aminah, S.Pd", jenisKelamin: "P", tempatLahir: "Bandung", tanggalLahir: "1987-05-21", alamat: "Jl. Cendana No. 12, Bandung", noHp: "081234567801", email: "siti.aminah@smanela.sch.id", mataPelajaran: "Bahasa Indonesia", status: "Aktif" },
  { id: "3", nip: "198803152013011003", nuptk: "890123456000003", nama: "Budi Hartono, S.Kom", jenisKelamin: "L", tempatLahir: "Surabaya", tanggalLahir: "1988-03-15", alamat: "Jl. Diponegoro No. 8, Surabaya", noHp: "081234567802", email: "budi.hartono@smanela.sch.id", mataPelajaran: "IPA", status: "Aktif" },
  { id: "4", nip: "199008122015012004", nuptk: "901234567000004", nama: "Dewi Kartika, S.Pd", jenisKelamin: "P", tempatLahir: "Yogyakarta", tanggalLahir: "1990-08-12", alamat: "Jl. Pandanaran No. 3, Yogyakarta", noHp: "081234567803", email: "dewi.kartika@smanela.sch.id", mataPelajaran: "Bahasa Inggris", status: "Aktif" },
  { id: "5", nip: "198609252011011005", nuptk: "234567890000005", nama: "Hendra Gunawan, S.Si", jenisKelamin: "L", tempatLahir: "Semarang", tanggalLahir: "1986-09-25", alamat: "Jl. Pemuda No. 20, Semarang", noHp: "081234567804", email: "hendra.gunawan@smanela.sch.id", mataPelajaran: "IPA", status: "Aktif" },
  { id: "6", nip: "199102072016012006", nuptk: "345678901000006", nama: "Rina Susanti, S.Pd.I", jenisKelamin: "P", tempatLahir: "Palembang", tanggalLahir: "1991-02-07", alamat: "Jl. Merdeka No. 15, Palembang", noHp: "081234567805", email: "rina.susanti@smanela.sch.id", mataPelajaran: "PAI", status: "Aktif" },
  { id: "7", nip: "198907142014011007", nuptk: "456789012000007", nama: "Agus Setiawan, S.Pd", jenisKelamin: "L", tempatLahir: "Medan", tanggalLahir: "1989-07-14", alamat: "Jl. Gatot Subroto No. 25, Medan", noHp: "081234567806", email: "agus.setiawan@smanela.sch.id", mataPelajaran: "PPKN", status: "Aktif" },
  { id: "8", nip: "199203012017012008", nuptk: "567890123000008", nama: "Maya Sari, S.Pd", jenisKelamin: "P", tempatLahir: "Makassar", tanggalLahir: "1992-03-01", alamat: "Jl. Ahmad Yani No. 10, Makassar", noHp: "081234567807", email: "maya.sari@smanela.sch.id", mataPelajaran: "IPS", status: "Aktif" },
];

const emptyForm: Omit<Guru, "id"> = {
  nip: "",
  nuptk: "",
  nama: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  noHp: "",
  email: "",
  mataPelajaran: "",
  status: "Aktif",
};

const ITEMS_PER_PAGE = 7;

export default function GuruPage() {
  const [data, setData] = useState<Guru[]>(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Guru | null>(null);

  const filtered = data.filter(
    (d) =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.nip.includes(search) ||
      d.nuptk.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nip) errs.nip = "NIP wajib diisi";
    if (!form.nuptk) errs.nuptk = "NUPTK wajib diisi";
    if (!form.nama) errs.nama = "Nama wajib diisi";
    if (!form.jenisKelamin) errs.jenisKelamin = "Jenis kelamin wajib dipilih";
    if (!form.mataPelajaran) errs.mataPelajaran = "Mata pelajaran wajib dipilih";
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
      setData((prev) => [...prev, { ...form, id: String(Date.now()) }]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (guru: Guru) => {
    setForm({
      nip: guru.nip,
      nuptk: guru.nuptk,
      nama: guru.nama,
      jenisKelamin: guru.jenisKelamin,
      tempatLahir: guru.tempatLahir,
      tanggalLahir: guru.tanggalLahir,
      alamat: guru.alamat,
      noHp: guru.noHp,
      email: guru.email,
      mataPelajaran: guru.mataPelajaran,
      status: guru.status,
    });
    setEditingId(guru.id);
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
        <h2 className="text-2xl font-bold text-gray-900">Data Guru</h2>
        <p className="text-sm text-gray-500 mt-1">Master Data &gt; Guru</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Daftar Guru</CardTitle>
              <CardDescription>Total {filtered.length} guru terdaftar</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama, NIP, atau NUPTK..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Guru
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
                  <TableHead>NIP/NUPTK</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((guru, idx) => (
                    <TableRow key={guru.id}>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-mono">{guru.nip}</div>
                          <div className="text-xs text-gray-500">NUPTK: {guru.nuptk}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{guru.nama}</div>
                          <div className="text-xs text-gray-500">{guru.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{guru.mataPelajaran}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={guru.status === "Aktif" ? "default" : "secondary"}>
                          {guru.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(guru)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(guru); setDeleteDialogOpen(true); }}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Guru" : "Tambah Guru"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data guru yang dipilih" : "Isi data guru baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>NIP *</Label>
              <Input value={form.nip} onChange={(e) => setField("nip", e.target.value)} placeholder="Masukkan NIP" />
              {errors.nip && <p className="text-sm text-red-500">{errors.nip}</p>}
            </div>
            <div className="space-y-2">
              <Label>NUPTK *</Label>
              <Input value={form.nuptk} onChange={(e) => setField("nuptk", e.target.value)} placeholder="Masukkan NUPTK" />
              {errors.nuptk && <p className="text-sm text-red-500">{errors.nuptk}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input value={form.nama} onChange={(e) => setField("nama", e.target.value)} placeholder="Masukkan nama lengkap" />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jenis Kelamin *</Label>
              <Select value={form.jenisKelamin} onValueChange={(v) => setField("jenisKelamin", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger>
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
              <Label>Mata Pelajaran *</Label>
              <Select value={form.mataPelajaran} onValueChange={(v) => setField("mataPelajaran", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih mata pelajaran" /></SelectTrigger>
                <SelectContent>
                  {["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS", "PPKN", "PAI", "Penjaskes", "SBk", "Prakarya", "TIK"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mataPelajaran && <p className="text-sm text-red-500">{errors.mataPelajaran}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  <SelectItem value="Pensiun">Pensiun</SelectItem>
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

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Guru</DialogTitle>
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
