export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'kepala_sekolah' 
  | 'waka_kurikulum' 
  | 'guru' 
  | 'wali_kelas' 
  | 'siswa' 
  | 'orang_tua'

export type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alpa' | 'terlambat'

export type Gender = 'L' | 'P'

export type Semester = 'ganjil' | 'genap'

export type GradeType = 'tugas' | 'uh' | 'uts' | 'uas' | 'sikap' | 'ekstrakurikuler'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  academic_year_id: string
  name: string
  grade: number
  major?: string
  homeroom_teacher_id?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  nisn: string
  nis: string
  full_name: string
  gender: Gender
  birth_place?: string
  birth_date?: string
  address?: string
  phone?: string
  email?: string
  photo_url?: string
  parent_id?: string
  class_id?: string
  academic_year_id: string
  enrollment_date: string
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  nip?: string
  nuptk?: string
  full_name: string
  gender: Gender
  birth_place?: string
  birth_date?: string
  address?: string
  phone?: string
  email?: string
  photo_url?: string
  subject_ids: string[]
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Parent {
  id: string
  full_name: string
  gender: Gender
  phone?: string
  email?: string
  address?: string
  occupation?: string
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  code: string
  name: string
  description?: string
  kkm?: number
  grade_level?: number
  semester?: Semester
  credits: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TeacherSubject {
  id: string
  teacher_id: string
  subject_id: string
  class_id: string
  academic_year_id: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  class_id: string
  subject_id: string
  teacher_id: string
  day_of_week: number
  start_time: string
  end_time: string
  room?: string
  academic_year_id: string
  semester: Semester
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  student_id: string
  schedule_id: string
  date: string
  status: AttendanceStatus
  notes?: string
  recorded_by: string
  created_at: string
  updated_at: string
}

export interface Grade {
  id: string
  student_id: string
  subject_id: string
  teacher_id: string
  academic_year_id: string
  semester: Semester
  grade_type: GradeType
  score: number
  max_score: number
  weight: number
  description?: string
  assessment_date: string
  created_at: string
  updated_at: string
}

export interface ReportCard {
  id: string
  student_id: string
  academic_year_id: string
  semester: Semester
  generated_at: string
  pdf_url?: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface Violation {
  id: string
  student_id: string
  teacher_id: string
  category: string
  points: number
  description: string
  incident_date: string
  action_taken?: string
  parent_notified: boolean
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  target_audience: 'all' | 'students' | 'teachers' | 'parents' | 'class' | 'role'
  target_class_id?: string
  target_role?: UserRole
  author_id: string
  published_at: string
  expires_at?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  reference_type?: string
  reference_id?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface ClassStudent {
  id: string
  class_id: string
  student_id: string
  academic_year_id: string
  enrollment_date: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface StudentParent {
  id: string
  student_id: string
  parent_id: string
  relationship: string
  is_primary: boolean
  created_at: string
  updated_at: string
}