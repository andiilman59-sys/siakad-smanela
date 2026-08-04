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
import { Save, Calculator } from "lucide-react";

interface NilaiSiswa {
  id: string;
  nama: string;
  nilai: number;
  bobot: number;
}

const siswaList: NilaiSiswa[] = [
  { id: "1", nama: "Ahmad Rizki Pratama", nilai: 85, bobot: 30 },
  { id: "2", nama: "Siti Nurhaliza", nilai: 92, bobot: 30 },
  { id: "3", nama: "Budi Santoso", nilai: 78, bobot: 30 },
  { id: "4", nama: "Dewi Anggraini", nilai: 88, bobot: 30 },
  { id: "5", nama: "Farhan Maulana", nilai: 75, bobot: 30 },
  { id: "6", nama: "Gita Puspita Sari", nilai: 95, bobot: 30 },
  { id: "7", nama: "Hendra Wijaya", nilai: 70, bobot: 30 },
  { id: "8", nama: "Indah Permata", nilai: 82, bobot: 30 },
  { id: "9", nama: "Joko Prasetyo", nilai: 80, bobot: 30 },
  { id: "10", nama: "Kartika Dewi Lestari", nilai: 90, bobot: 30 },
];

const kelasList = ["X-A", "X-B", "XI-A", "XI-B", "XII-A", "XII-B"];
const mapelList = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS", "PPKN", "PAI", "Penjaskes", "SBK", "Prakarya"];
const gradeTypes = ["UTS", "UAS", "Tugas", "PTS", "Praktek"];

export default function PenilaianPage() {
  const [selectedKelas, setSelectedKelas] = useState("X-A");
  const [selectedMapel, setSelectedMapel] = useState("Matematika");
  const [selectedTipe, setSelectedTipe] = useState("UTS");
  const [data, setData] = useState<NilaiSiswa[]>(siswaList);
  const [saved, setSaved] = useState(false);

  const updateNilai = (id: string, field: "nilai" | "bobot", value: number) => {
    setData((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
    setSaved(false);
  };

  const hitungNilaiAkhir = (nilai: number, bobot: number) => {
    return ((nilai * bobot) / 100).toFixed(1);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const rataRata = data.length > 0
    ? (data.reduce((sum, d) => sum + d.nilai, 0) / data.length).toFixed(1)
    : "0";

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
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select value={selectedMapel} onValueChange={setSelectedMapel}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Pilih mapel" />
                </SelectTrigger>
                <SelectContent>
                  {mapelList.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipe Penilaian</Label>
              <Select value={selectedTipe} onValueChange={setSelectedTipe}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {gradeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {saved ? "Tersimpan!" : "Simpan Nilai"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{data.length}</div>
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
            <div className="text-2xl font-bold text-green-600">
              {data.filter((d) => d.nilai >= 75).length}
            </div>
            <p className="text-sm text-gray-500">Tuntas KKM</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daftar Nilai - {selectedMapel} ({selectedTipe})
          </CardTitle>
          <CardDescription>Kelas {selectedKelas} | Masukkan nilai dan bobot penilaian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead className="w-28 text-center">Nilai</TableHead>
                  <TableHead className="w-28 text-center">Bobot (%)</TableHead>
                  <TableHead className="w-28 text-center">Nilai Akhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((siswa, idx) => {
                  const nilaiAkhir = hitungNilaiAkhir(siswa.nilai, siswa.bobot);
                  const isPassed = siswa.nilai >= 75;
                  return (
                    <TableRow key={siswa.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{siswa.nama}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={siswa.nilai}
                          onChange={(e) => updateNilai(siswa.id, "nilai", Number(e.target.value))}
                          className="text-center w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={siswa.bobot}
                          onChange={(e) => updateNilai(siswa.id, "bobot", Number(e.target.value))}
                          className="text-center w-full"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isPassed ? "default" : "destructive"}>
                          <Calculator className="h-3 w-3 mr-1" />
                          {nilaiAkhir}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
