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
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function PengumumanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pengumuman</h2>
        <p className="text-sm text-gray-500 mt-1">Informasi &gt; Pengumuman Sekolah</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada pengumuman</p>
          <p className="text-sm mt-1">Pengumuman akan ditampilkan di sini</p>
        </CardContent>
      </Card>
    </div>
  );
}
