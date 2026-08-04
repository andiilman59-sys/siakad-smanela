"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  Award,
  Bell,
  AlertTriangle,
  Settings,
  ChevronDown,
  School,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Menu Utama",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      { title: "Siswa", href: "/dashboard/siswa", icon: Users },
      { title: "Guru", href: "/dashboard/guru", icon: GraduationCap },
      { title: "Kelas", href: "/dashboard/kelas", icon: School },
      { title: "Mata Pelajaran", href: "/dashboard/mapel", icon: BookOpen },
      { title: "Tahun Ajaran", href: "/dashboard/tahun-ajaran", icon: Calendar },
    ],
  },
  {
    title: "Akademik",
    items: [
      { title: "Jadwal", href: "/dashboard/jadwal", icon: Calendar },
      { title: "Presensi", href: "/dashboard/presensi", icon: ClipboardCheck },
      { title: "Penilaian", href: "/dashboard/penilaian", icon: FileText },
      { title: "Rapor", href: "/dashboard/rapor", icon: Award },
    ],
  },
  {
    title: "Lainnya",
    items: [
      { title: "Kedisiplinan", href: "/dashboard/kedisiplinan", icon: AlertTriangle },
      { title: "Pengumuman", href: "/dashboard/pengumuman", icon: Bell },
      { title: "Notifikasi", href: "/dashboard/notifikasi", icon: Bell },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      navSections.forEach((section) => {
        initial[section.title] = true;
      });
      return initial;
    }
  );

  function toggleSection(title: string) {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white h-full transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-blue-900 text-sm">SIAKAD SMANELA</span>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-2">
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
              >
                {section.title}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    !openSections[section.title] && "-rotate-90"
                  )}
                />
              </button>
            )}
            {collapsed && (
              <div className="px-4 py-1.5">
                <Separator />
              </div>
            )}
            {openSections[section.title] && (
              <nav className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        ))}
      </ScrollArea>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-center text-gray-500 hover:text-gray-700",
            collapsed && "px-2"
          )}
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span className="ml-2">Kecilkan</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
