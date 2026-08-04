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
import { getMapel, createMapel, updateMapel, deleteMapel } from "@/lib/actions/mapel"
import type { Subject } from "@/types/database"
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
  code: "",
  name: "",
  description: "",
  kkm: "70",
  grade_level: "",
  semester: "" as "ganjil" | "genap" | "",
  credits: "2",
}

export default function MapelPage() {
  const { toast } = useToast()
  const [data, setData] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await getMapel()
    if (result.success && result.data) {
      setData(result.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = data.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.code) errs.code = "Kode wajib diisi"
    if (!form.name) errs.name = "Nama mapel wajib diisi"
    if (!form.kkm) errs.kkm = "KKM wajib diisi"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSubmitting(true)

    const payload: Partial<Subject> = {
      code: form.code,
      name: form.name,
      description: form.description || undefined,
      kkm: Number(form.kkm),
      grade_level: form.grade_level ? Number(form.grade_level) : undefined,
      semester: (form.semester as "ganjil" | "genap") || undefined,
      credits: Number(form.credits),
    }

    let result
    if (editingId) {
      result = await updateMapel(editingId, payload)
    } else {
      result = await createMapel({ ...payload, is_active: true })
    }

    if (result.success) {
      toast({ title: editingId ? "Berhasil" : "Berhasil", description: editingId ? "Data mapel berhasil diperbarui" : "Data mapel berhasil ditambahkan" })
      setDialogOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      loadData()
    } else {
      toast({ title: "Gagal", description: result.error || "Terjadi kesalahan", variant: "destructive" })
    }
    setSubmitting(false)
  }

  const handleEdit = (mapel: Subject) => {
    setForm({
      code: mapel.code,
      name: mapel.name,
      description: mapel.description || "",
      kkm: String(mapel.kkm ?? 70),
      grade_level: mapel.grade_level ? String(mapel.grade_level) : "",
      semester: mapel.semester || "",
      credits: String(mapel.credits),
    })
    setEditingId(mapel.id)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    const result = await deleteMapel(deleteTarget.id)
    if (result.success) {
      toast({ title: "Berhasil", description: "Data mapel berhasil dihapus" })
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
                <Input
                  placeholder="Cari nama atau kode..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Mapel
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
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Tidak ada data ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((mapel, idx) => (
                        <TableRow key={mapel.id}>
                          <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                          <TableCell><Badge variant="outline">{mapel.code}</Badge></TableCell>
                          <TableCell>
                            <div className="font-medium">{mapel.name}</div>
                            {mapel.description && <div className="text-xs text-gray-500 line-clamp-1">{mapel.description}</div>}
                          </TableCell>
                          <TableCell className="text-center font-semibold">{mapel.kkm}</TableCell>
                          <TableCell>{mapel.semester === "ganjil" ? "Ganjil" : mapel.semester === "genap" ? "Genap" : "-"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={mapel.is_active ? "default" : "secondary"}>
                              {mapel.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(mapel)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => { setDeleteTarget(mapel); setDeleteDialogOpen(true) }}>
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
            <DialogTitle>{editingId ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}</DialogTitle>
            <DialogDescription>{editingId ? "Ubah data mata pelajaran yang dipilih" : "Isi data mata pelajaran baru"}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Kode *</Label>
              <Input value={form.code} onChange={(e) => setField("code", e.target.value)} placeholder="Contoh: MTK" />
              {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nama Mapel *</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Masukkan nama mata pelajaran" />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Masukkan deskripsi mata pelajaran" />
            </div>
            <div className="space-y-2">
              <Label>KKM *</Label>
              <Input type="number" value={form.kkm} onChange={(e) => setField("kkm", e.target.value)} placeholder="Masukkan KKM" />
              {errors.kkm && <p className="text-sm text-red-500">{errors.kkm}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tingkat</Label>
              <Select value={form.grade_level} onValueChange={(v) => setField("grade_level", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih tingkat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 (X)</SelectItem>
                  <SelectItem value="11">11 (XI)</SelectItem>
                  <SelectItem value="12">12 (XII)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={form.semester} onValueChange={(v) => setField("semester", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ganjil">Ganjil</SelectItem>
                  <SelectItem value="genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>SKS</Label>
              <Input type="number" value={form.credits} onChange={(e) => setField("credits", e.target.value)} placeholder="Masukkan SKS" />
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
            <DialogTitle>Hapus Mata Pelajaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
