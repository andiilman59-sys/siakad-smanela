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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, FileText } from "lucide-react";

interface Pengumuman {
  id: string;
  judul: string;
  konten: string;
  penulis: string;
  tanggal: string;
  kategori: string;
  pinned: boolean;
}

const initialData: Pengumuman[] = [
  {
    id: "1",
    judul: "Jadwal Ujian Tengah Semester Genap 2025/2026",
    konten: "Diberitahukan kepada seluruh siswa bahwa Ujian Tengah Semester (UTS) Genap akan dilaksanakan mulai tanggal 15 - 26 Maret 2026. Mohon mempersiapkan diri dengan baik dan mematuhi jadwal yang telah ditentukan.",
    penulis: "Drs. H. Ahmad Fauzi, M.Pd",
    tanggal: "2025-07-20",
    kategori: "Akademik",
    pinned: true,
  },
  {
    id: "2",
    judul: "Pengumuman Peringatan Hari Kemerdekaan RI",
    konten: "Dalam rangka memperingati Hari Kemerdekaan Republik Indonesia ke-81, sekolah akan mengadakan berbagai lomba dan kegiatan pada tanggal 17 Agustus 2026. Seluruh siswa diharapkan berpartisipasi aktif.",
    penulis: "Kepala Sekolah",
    tanggal: "2025-07-18",
    kategori: "Kegiatan",
    pinned: false,
  },
  {
    id: "3",
    judul: "Pembagian Rapor Semester Genap",
    konten: "Pembagian rapor semester genap tahun ajaran 2025/2026 akan dilaksanakan pada tanggal 30 Juni 2026. Orang tua/wali diharapkan hadir pukul 08:00 WIB di aula sekolah.",
    penulis: "Wakil Kepala Sekolah",
    tanggal: "2025-07-15",
    kategori: "Akademik",
    pinned: false,
  },
  {
    id: "4",
    judul: "Kegiatan Field Trip Kelas XII",
    konten: "Kelas XII akan melaksanakan kegiatan field trip ke beberapa kampus ternama di Jawa Barat pada tanggal 5-7 Juli 2026. Pendaftaran dan pembayaran biaya kegiatan dapat dilakukan kepada wali kelas masing-masing.",
    penulis: "Bagian Kesiswaan",
    tanggal: "2025-07-12",
    kategori: "Kegiatan",
    pinned: false,
  },
  {
    id: "5",
    judul: "Rekruitmen Pengurus OSIS Baru",
    konten: "Bagi siswa yang berminat menjadi pengurus OSIS periode 2026/2027, silakan mendaftar melalui form online yang tersedia. Batas pendaftaran tanggal 25 Juli 2026. Seleksi akan dilaksanakan pada tanggal 28 Juli 2026.",
    penulis: "Pembina OSIS",
    tanggal: "2025-07-10",
    kategori: "Kesiswaan",
    pinned: false,
  },
];

const emptyForm: Omit<Pengumuman, "id" | "tanggal" | "pinned"> = {
  judul: "",
  konten: "",
  penulis: "",
  kategori: "",
};

const kategoriList = ["Akademik", "Kegiatan", "Kesiswaan", "Pengumuman Umum", "Keagamaan", "Olahraga"];

export default function PengumumanPage() {
  const [data, setData] = useState<Pengumuman[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.judul) errs.judul = "Judul wajib diisi";
    if (!form.konten) errs.konten = "Konten wajib diisi";
    if (!form.penulis) errs.penulis = "Penulis wajib diisi";
    if (!form.kategori) errs.kategori = "Kategori wajib dipilih";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const tanggal = new Date().toISOString().split("T")[0];
    if (editingId) {
      setData((prev) => prev.map((d) => (d.id === editingId ? { ...d, ...form } : d)));
    } else {
      setData((prev) => [{ ...form, id: String(Date.now()), tanggal, pinned: false }, ...prev]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const getKategoriColor = (kategori: string) => {
    const colors: Record<string, string> = {
      Akademik: "bg-blue-100 text-blue-800",
      Kegiatan: "bg-green-100 text-green-800",
      Kesiswaan: "bg-purple-100 text-purple-800",
      "Pengumuman Umum": "bg-orange-100 text-orange-800",
      Keagamaan: "bg-teal-100 text-teal-800",
      Olahraga: "bg-red-100 text-red-800",
    };
    return colors[kategori] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pengumuman</h2>
          <p className="text-sm text-gray-500 mt-1">Informasi &gt; Pengumuman Sekolah</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Pengumuman
        </Button>
      </div>

      {/* Pinned */}
      {data.filter((d) => d.pinned).length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-yellow-600">📌</span> Pengumuman Penting (Dipinned)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.filter((d) => d.pinned).map((item) => (
              <div key={item.id} className="border-b border-yellow-200 last:border-0 pb-4 last:pb-0">
                <h3 className="font-semibold text-gray-900">{item.judul}</h3>
                <p className="text-sm text-gray-600 mt-2">{item.konten}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.penulis}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(item.tanggal)}</span>
                  <Badge className={getKategoriColor(item.kategori)}>{item.kategori}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Announcements */}
      <div className="space-y-4">
        {data.filter((d) => !d.pinned).map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.judul}</CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.penulis}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(item.tanggal)}</span>
                  </CardDescription>
                </div>
                <Badge className={getKategoriColor(item.kategori)}>{item.kategori}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{item.konten}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data pengumuman" : "Isi detail pengumuman baru"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input value={form.judul} onChange={(e) => setField("judul", e.target.value)} placeholder="Masukkan judul pengumuman" />
              {errors.judul && <p className="text-sm text-red-500">{errors.judul}</p>}
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <div className="flex flex-wrap gap-2">
                {kategoriList.map((k) => (
                  <Button
                    key={k}
                    type="button"
                    variant={form.kategori === k ? "default" : "outline"}
                    size="sm"
                    onClick={() => setField("kategori", k)}
                  >
                    {k}
                  </Button>
                ))}
              </div>
              {errors.kategori && <p className="text-sm text-red-500">{errors.kategori}</p>}
            </div>
            <div className="space-y-2">
              <Label>Penulis *</Label>
              <Input value={form.penulis} onChange={(e) => setField("penulis", e.target.value)} placeholder="Nama penulis/instansi" />
              {errors.penulis && <p className="text-sm text-red-500">{errors.penulis}</p>}
            </div>
            <div className="space-y-2">
              <Label>Isi Pengumuman *</Label>
              <Textarea value={form.konten} onChange={(e) => setField("konten", e.target.value)} placeholder="Tulis isi pengumuman..." className="min-h-[120px]" />
              {errors.konten && <p className="text-sm text-red-500">{errors.konten}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editingId ? "Simpan Perubahan" : "Publikasikan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
