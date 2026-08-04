"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getNilai, saveNilai } from "@/lib/actions/penilaian";
import { getKelas } from "@/lib/actions/kelas";
import { getMapel } from "@/lib/actions/mapel";
import { getGuru } from "@/lib/actions/guru";
import type { Class, Subject, Teacher, Grade, GradeType } from "@/types/database";
import { Save, Calculator } from "lucide-react";

const gradeTypes: { value: GradeType; label: string }[] = [
  { value: "tugas", label: "Tugas" },
  { value: "uh", label: "UH" },
  { value: "uts", label: "UTS" },
  { value: "uas", label: "UAS" },
];

interface StudentGrade {
  student_id: string;
  full_name: string;
  score: number;
}

export default function PenilaianPage() {
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedGradeType, setSelectedGradeType] = useState<GradeType>("tugas");
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [kelasList, setKelasList] = useState<Class[]>([]);
  const [mapelList, setMapelList] = useState<Subject[]>([]);
  const [guruList, setGuruList] = useState<Teacher[]>([]);

  const loadForeignData = useCallback(async () => {
    const [kRes, mRes, gRes] = await Promise.all([
      getKelas(),
      getMapel(),
      getGuru(),
    ]);
    if (kRes.success && kRes.data) setKelasList(kRes.data);
    if (mRes.success && mRes.data) setMapelList(mRes.data);
    if (gRes.success && gRes.data) setGuruList(gRes.data);
  }, []);

  useEffect(() => {
    loadForeignData();
  }, [loadForeignData]);

  const loadGrades = useCallback(async () => {
    if (!selectedClassId || !selectedSubjectId) {
      setGrades([]);
      return;
    }
    setLoading(true);
    const result = await getNilai(selectedClassId, selectedSubjectId);
    if (result.success && result.data) {
      const mapped: StudentGrade[] = result.data.map((g) => ({
        student_id: g.student_id,
        full_name: g.student_id,
        score: g.score,
      }));
      setGrades(mapped);
    } else {
      setGrades([]);
    }
    setLoading(false);
  }, [selectedClassId, selectedSubjectId]);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId) {
      loadGrades();
    }
  }, [selectedClassId, selectedSubjectId, loadGrades]);

  const updateScore = (studentId: string, score: number) => {
    setGrades((prev) =>
      prev.map((g) => (g.student_id === studentId ? { ...g, score } : g))
    );
  };

  const handleSave = async () => {
    if (!selectedClassId || !selectedSubjectId || grades.length === 0) return;
    setSaving(true);

    const records = grades.map((g) => ({
      student_id: g.student_id,
      subject_id: selectedSubjectId,
      teacher_id: "",
      academic_year_id: "",
      semester: "ganjil" as const,
      grade_type: selectedGradeType,
      score: g.score,
      max_score: 100,
      weight: 1,
      assessment_date: new Date().toISOString().split("T")[0],
    }));

    const result = await saveNilai(records);
    if (result.success) {
      toast({ title: "Berhasil", description: "Data nilai berhasil disimpan" });
    } else {
      toast({ title: "Gagal", description: result.error || "Gagal menyimpan nilai", variant: "destructive" });
    }
    setSaving(false);
  };

  const rataRata = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
    : "0";

  const totalTuntas = grades.filter((g) => g.score >= 75).length;

  const selectedClassName = kelasList.find((k) => k.id === selectedClassId)?.name || "Pilih Kelas";
  const selectedSubjectName = mapelList.find((m) => m.id === selectedSubjectId)?.name || "Pilih Mapel";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Input Penilaian</h2>
        <p className="text-sm text-gray-500 mt-1">Akademik &gt; Penilaian</p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Pilih mapel" />
                </SelectTrigger>
                <SelectContent>
                  {mapelList.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jenis Penilaian</Label>
              <Select value={selectedGradeType} onValueChange={(v) => setSelectedGradeType(v as GradeType)}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {gradeTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave} disabled={saving || !selectedClassId || !selectedSubjectId || grades.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Menyimpan..." : "Simpan Nilai"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-sm text-gray-500">Total Siswa</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{rataRata}</div>
            <p className="text-sm text-gray-500">Rata-rata Nilai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{totalTuntas}</div>
            <p className="text-sm text-gray-500">Tuntas KKM</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daftar Nilai - {selectedSubjectName} ({gradeTypes.find((t) => t.value === selectedGradeType)?.label})
          </CardTitle>
          <CardDescription>Kelas {selectedClassName} | Masukkan nilai penilaian</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedClassId || !selectedSubjectId ? (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Pilih kelas dan mata pelajaran terlebih dahulu</p>
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada data siswa untuk kelas dan mata pelajaran ini</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="w-32 text-center">Nilai</TableHead>
                      <TableHead className="w-28 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((siswa, idx) => {
                      const isPassed = siswa.score >= 75;
                      return (
                        <TableRow key={siswa.student_id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">{siswa.full_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={siswa.score}
                              onChange={(e) => updateScore(siswa.student_id, Number(e.target.value))}
                              className="text-center w-full"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={isPassed ? "default" : "destructive"}>
                              {isPassed ? "Tuntas" : "Belum Tuntas"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-4">
                <div className="bg-gray-50 rounded-md px-4 py-2 text-sm">
                  <span className="text-gray-500">Rata-rata: </span>
                  <span className="font-bold text-blue-600">{rataRata}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
