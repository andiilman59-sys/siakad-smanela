"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getSiswa, createSiswa, updateSiswa, deleteSiswa } from "@/lib/actions/siswa"
import { getKelas } from "@/lib/actions/kelas"
import { getTahunAjaran } from "@/lib/actions/tahun-ajaran"
import type { Student, Class, AcademicYear } from "@/types/database"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const ITEMS_PER_PAGE = 10

const emptyForm = {
  nisn: "",
  nis: "",
  full_name: "",
  gender: "" as "L" | "P" | "",
  birth_place: "",
  birth_date: "",
  address: "",
  phone: "",
  email: "",
  class_id: "",
  academic_year_id: "",
  status: "active" as "active" | "inactive" | "graduated" | "transferred",
}

export default function SiswaPage() {
  const { toast } = useToast()
  const [data, setData] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [kelasList, setKelasList] = useState<Class[]>([])
  const [tahunAjaranList, setTahunAjaranList] = useState<AcademicYear[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await getSiswa()
    if (result.success && result.data) {
      setData(result.data)
    }
    setLoading(false)
  }, [])

  const loadForeignData = useCallback(async () => {
    const [kelasResult, taResult] = await Promise.all([
      getKelas(),
      getTahunAjaran(),
    ])
    if (kelasResult.success && kelasResult.data) setKelasList(kelasResult.data)
    if (taResult.success && taResult.data) setTahunAjaranList(taResult.data)
  }, [])

  useEffect(() => {
    loadData()
    loadForeignData()
  }, [loadData, loadForeignData])

  const filtered = data.filter(
    (d) =>
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.nisn.includes(search) ||
      d.nis.includes(search)
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.nisn) errs.nisn = "NISN wajib diisi"
    if (!form.nis) errs.nis = "NIS wajib diisi"
    if (!form.full_name) errs.full_name = "Nama wajib diisi"
    if (!form.gender) errs.gender = "Jenis kelamin wajib dipilih"
    if (!form.academic_year_id) errs.academic_year_id = "Tahun ajaran wajib dipilih"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSubmitting(true)

    const payload: Partial<Student> = {
      nisn: form.nisn,
      nis: form.nis,
      full_name: form.full_name,
      gender: form.gender as "L" | "P",
      birth_place: form.birth_place || undefined,
      birth_date: form.birth_date || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      class_id: form.class_id || undefined,
      academic_year_id: form.academic_year_id,
      status: form.status,
    }

    let result
    if (editingId) {
      result = await updateSiswa(editingId, payload)
    } else {
      result = await createSiswa({
        ...payload,
        enrollment_date: new Date().toISOString().split("T")[0],
      })
    }

    if (result.success) {
      toast({ title: editingId ? "Berhasil" : "Berhasil", description: editingId ? "Data siswa berhasil diperbarui" : "Data siswa berhasil ditambahkan" })
      setDialogOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      loadData()
    } else {
      toast({ title: "Gagal", description: result.error || "Terjadi kesalahan", variant: "destructive" })
    }
    setSubmitting(false)
  }

  const handleEdit = (siswa: Student) => {
    setForm({
      nisn: siswa.nisn,
      nis: siswa.nis,
      full_name: siswa.full_name,
      gender: siswa.gender,
      birth_place: siswa.birth_place || "",
      birth_date: siswa.birth_date || "",
      address: siswa.address || "",
      phone: siswa.phone || "",
      email: siswa.email || "",
      class_id: siswa.class_id || "",
      academic_year_id: siswa.academic_year_id,
      status: siswa.status,
    })
    setEditingId(siswa.id)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    const result = await deleteSiswa(deleteTarget.id)
    if (result.success) {
      toast({ title: "Berhasil", description: "Data siswa berhasil dihapus" })
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      loadData()
    } else {
      toast({ title: "Gagal", description: result.error || "Gagal menghapus data", variant: "destructive" })
    }
    setSubmitting(false)
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setErrors({})
    setDialogOpen(true)
  }

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const statusLabel: Record<string, string> = {
    active: "Aktif",
    inactive: "Tidak Aktif",
    graduated: "Lulus",
    transferred: "Pindah",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Siswa</h2>
        <p className="text-sm text-gray-500 mt-1">Master Data &gt; Siswa</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Daftar Siswa</CardTitle>
              <CardDescription>Total {filtered.length} siswa terdaftar</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama atau NISN..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
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
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>NISN</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead className="text-center">Jenis Kelamin</TableHead>
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
                            <div className="font-medium">{siswa.full_name}</div>
                            {siswa.email && <div className="text-xs text-gray-500">{siswa.email}</div>}
                          </TableCell>
                          <TableCell className="text-center">{siswa.gender === "L" ? "Laki-laki" : "Perempuan"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={siswa.status === "active" ? "default" : "secondary"}>
                              {statusLabel[siswa.status] || siswa.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(siswa)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(siswa); setDeleteDialogOpen(true) }}>
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
                  <p className="text-sm text-gray-500">
                    Halaman {page} dari {totalPages}
                  </p>
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
            </>
          )}
        </CardContent>
      </Card>

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
              <Input value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} placeholder="Masukkan nama lengkap" />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jenis Kelamin *</Label>
              <Select value={form.gender} onValueChange={(v) => setField("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tempat Lahir</Label>
              <Input value={form.birth_place} onChange={(e) => setField("birth_place", e.target.value)} placeholder="Masukkan tempat lahir" />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input type="date" value={form.birth_date} onChange={(e) => setField("birth_date", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Alamat</Label>
              <Textarea value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder="Masukkan alamat lengkap" />
            </div>
            <div className="space-y-2">
              <Label>No HP</Label>
              <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="Masukkan nomor HP" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="Masukkan email" />
            </div>
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={form.class_id} onValueChange={(v) => setField("class_id", v)}>
                <SelectTrigger>
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
              <Label>Tahun Ajaran *</Label>
              <Select value={form.academic_year_id} onValueChange={(v) => setField("academic_year_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {tahunAjaranList.map((ta) => (
                    <SelectItem key={ta.id} value={ta.id}>{ta.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.academic_year_id && <p className="text-sm text-red-500">{errors.academic_year_id}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v: "active" | "inactive" | "graduated" | "transferred") => setField("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="graduated">Lulus</SelectItem>
                  <SelectItem value="transferred">Pindah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Siswa</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data <strong>{deleteTarget?.full_name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
