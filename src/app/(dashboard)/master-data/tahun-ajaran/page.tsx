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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getTahunAjaran, createTahunAjaran, updateTahunAjaran, deleteTahunAjaran } from "@/lib/actions/tahun-ajaran"
import type { AcademicYear } from "@/types/database"
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
  name: "",
  start_date: "",
  end_date: "",
  is_active: false,
}

export default function TahunAjaranPage() {
  const { toast } = useToast()
  const [data, setData] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<AcademicYear | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await getTahunAjaran()
    if (result.success && result.data) {
      setData(result.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
    if (!form.name) errs.name = "Nama tahun ajaran wajib diisi"
    if (!form.start_date) errs.start_date = "Tanggal mulai wajib diisi"
    if (!form.end_date) errs.end_date = "Tanggal selesai wajib diisi"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      name: form.name,
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: form.is_active,
    }

    let result
    if (editingId) {
      result = await updateTahunAjaran(editingId, payload)
    } else {
      result = await createTahunAjaran(payload)
    }

    if (result.success) {
      toast({ title: editingId ? "Berhasil" : "Berhasil", description: editingId ? "Data tahun ajaran berhasil diperbarui" : "Data tahun ajaran berhasil ditambahkan" })
      setDialogOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      loadData()
    } else {
      toast({ title: "Gagal", description: result.error || "Terjadi kesalahan", variant: "destructive" })
    }
    setSubmitting(false)
  }

  const handleEdit = (item: AcademicYear) => {
    setForm({
      name: item.name,
      start_date: item.start_date.split("T")[0],
      end_date: item.end_date.split("T")[0],
      is_active: item.is_active,
    })
    setEditingId(item.id)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    const result = await deleteTahunAjaran(deleteTarget.id)
    if (result.success) {
      toast({ title: "Berhasil", description: "Data tahun ajaran berhasil dihapus" })
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

  const setField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (typeof value === "string" && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

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
                <Input
                  placeholder="Cari tahun ajaran..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Tahun Ajaran
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
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Tidak ada data ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{formatDate(item.start_date)}</TableCell>
                          <TableCell>{formatDate(item.end_date)}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={item.is_active ? "default" : "secondary"}>
                              {item.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(item); setDeleteDialogOpen(true) }}>
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
            <DialogTitle>{editingId ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data tahun ajaran yang dipilih" : "Isi data tahun ajaran baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nama Tahun Ajaran *</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Contoh: 2025/2026" />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tanggal Mulai *</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setField("start_date", e.target.value)} />
              {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tanggal Selesai *</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setField("end_date", e.target.value)} />
              {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked as boolean }))}
                />
                Status Aktif
              </Label>
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
            <DialogTitle>Hapus Tahun Ajaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tahun ajaran <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
