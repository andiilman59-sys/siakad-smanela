"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotifikasiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notifikasi</h2>
        <p className="text-sm text-gray-500 mt-1">Informasi &gt; Notifikasi</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada notifikasi</p>
          <p className="text-sm mt-1">Notifikasi akan ditampilkan di sini</p>
        </CardContent>
      </Card>
    </div>
  );
}
