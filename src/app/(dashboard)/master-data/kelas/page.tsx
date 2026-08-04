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
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getKelasWithCounts, createKelas, updateKelas, deleteKelas } from "@/lib/actions/kelas"
import { getTahunAjaran } from "@/lib/actions/tahun-ajaran"
import type { AcademicYear } from "@/types/database"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface KelasWithCount {
  id: string
  academic_year_id: string
  name: string
  grade: number
  major?: string
  homeroom_teacher_id?: string
  created_at: string
  updated_at: string
  student_count: number
}

const ITEMS_PER_PAGE = 10

const emptyForm = {
  name: "",
  grade: "",
  academic_year_id: "",
}

export default function KelasPage() {
  const { toast } = useToast()
  const [data, setData] = useState<KelasWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<KelasWithCount | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [tahunAjaranList, setTahunAjaranList] = useState<AcademicYear[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await getKelasWithCounts()
    if (result.success && result.data) {
      setData(result.data)
    }
    setLoading(false)
  }, [])

  const loadForeignData = useCallback(async () => {
    const taResult = await getTahunAjaran()
    if (taResult.success && taResult.data) setTahunAjaranList(taResult.data)
  }, [])

  useEffect(() => {
    loadData()
    loadForeignData()
  }, [loadData, loadForeignData])

  const filtered = data.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name) errs.name = "Nama kelas wajib diisi"
    if (!form.grade) errs.grade = "Tingkat wajib dipilih"
    if (!form.academic_year_id) errs.academic_year_id = "Tahun ajaran wajib dipilih"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      name: form.name,
      grade: Number(form.grade),
      academic_year_id: form.academic_year_id,
    }

    let result
    if (editingId) {
      result = await updateKelas(editingId, payload)
    } else {
      result = await createKelas(payload)
    }

    if (result.success) {
      toast({ title: editingId ? "Berhasil" : "Berhasil", description: editingId ? "Data kelas berhasil diperbarui" : "Data kelas berhasil ditambahkan" })
      setDialogOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      loadData()
    } else {
      toast({ title: "Gagal", description: result.error || "Terjadi kesalahan", variant: "destructive" })
    }
    setSubmitting(false)
  }

  const handleEdit = (kelas: KelasWithCount) => {
    setForm({
      name: kelas.name,
      grade: String(kelas.grade),
      academic_year_id: kelas.academic_year_id,
    })
    setEditingId(kelas.id)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    const result = await deleteKelas(deleteTarget.id)
    if (result.success) {
      toast({ title: "Berhasil", description: "Data kelas berhasil dihapus" })
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

  const gradeLabel: Record<number, string> = { 10: "X", 11: "XI", 12: "XII" }

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
                <Input
                  placeholder="Cari nama kelas..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kelas
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
                      <TableHead>Nama Kelas</TableHead>
                      <TableHead className="text-center">Tingkat</TableHead>
                      <TableHead className="text-center">Jumlah Siswa</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Tidak ada data ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((kelas, idx) => (
                        <TableRow key={kelas.id}>
                          <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{kelas.name}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">Tingkat {gradeLabel[kelas.grade] || kelas.grade}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{kelas.student_count}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(kelas)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(kelas); setDeleteDialogOpen(true) }}>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Kelas" : "Tambah Kelas"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data kelas yang dipilih" : "Isi data kelas baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nama Kelas *</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Contoh: X-A" />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tingkat *</Label>
              <Select value={form.grade} onValueChange={(v) => setField("grade", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih tingkat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 (X)</SelectItem>
                  <SelectItem value="11">11 (XI)</SelectItem>
                  <SelectItem value="12">12 (XII)</SelectItem>
                </SelectContent>
              </Select>
              {errors.grade && <p className="text-sm text-red-500">{errors.grade}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Tahun Ajaran *</Label>
              <Select value={form.academic_year_id} onValueChange={(v) => setField("academic_year_id", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                <SelectContent>
                  {tahunAjaranList.map((ta) => (
                    <SelectItem key={ta.id} value={ta.id}>{ta.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.academic_year_id && <p className="text-sm text-red-500">{errors.academic_year_id}</p>}
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
            <DialogTitle>Hapus Kelas</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kelas <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
