-- FULL SCHEMA + RLS for SIAKAD SMANELA

-- =============================================================================
-- 0. CLEAN SLATE: Drop everything
-- =============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_role();

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS violations CASCADE;
DROP TABLE IF EXISTS report_cards CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS teacher_subjects CASCADE;
DROP TABLE IF EXISTS student_parents CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS report_card_status CASCADE;
DROP TYPE IF EXISTS teacher_status CASCADE;
DROP TYPE IF EXISTS student_status CASCADE;
DROP TYPE IF EXISTS grade_type CASCADE;
DROP TYPE IF EXISTS semester CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. ENUM TYPES
-- =============================================================================
CREATE TYPE user_role AS ENUM (
  'super_admin','admin','kepala_sekolah','waka_kurikulum',
  'guru','wali_kelas','siswa','orang_tua'
);
CREATE TYPE attendance_status AS ENUM ('hadir','sakit','izin','alpa','terlambat');
CREATE TYPE gender AS ENUM ('L','P');
CREATE TYPE semester AS ENUM ('ganjil','genap');
CREATE TYPE grade_type AS ENUM ('tugas','uh','uts','uas','sikap','ekstrakurikuler');
CREATE TYPE student_status AS ENUM ('active','inactive','graduated','transferred');
CREATE TYPE teacher_status AS ENUM ('active','inactive');
CREATE TYPE report_card_status AS ENUM ('draft','published','archived');
CREATE TYPE notification_type AS ENUM ('info','warning','success','error');

-- =============================================================================
-- 3. TABLES
-- =============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'siswa',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  major TEXT,
  homeroom_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(academic_year_id, name)
);

CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  gender gender NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  occupation TEXT,
  profile_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nisn TEXT NOT NULL UNIQUE,
  nis TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  gender gender NOT NULL,
  birth_place TEXT,
  birth_date DATE,
  address TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status student_status DEFAULT 'active',
  profile_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nip TEXT UNIQUE,
  nuptk TEXT UNIQUE,
  full_name TEXT NOT NULL,
  gender gender NOT NULL,
  birth_place TEXT,
  birth_date DATE,
  address TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  status teacher_status DEFAULT 'active',
  profile_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  kkm INTEGER,
  grade_level INTEGER,
  semester semester,
  credits INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status student_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id, academic_year_id)
);

CREATE TABLE student_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

CREATE TABLE teacher_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id, class_id, academic_year_id)
);

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester semester NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, schedule_id, date)
);

CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester semester NOT NULL,
  grade_type grade_type NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  description TEXT,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester semester NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  status report_card_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, academic_year_id, semester)
);

CREATE TABLE violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_taken TEXT,
  parent_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all',
  target_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  target_role user_role,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. INDEXES
-- =============================================================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_students_academic_year ON students(academic_year_id);
CREATE INDEX idx_teachers_status ON teachers(status);
CREATE INDEX idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX idx_class_students_class ON class_students(class_id);
CREATE INDEX idx_class_students_student ON class_students(student_id);
CREATE INDEX idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX idx_teacher_subjects_class ON teacher_subjects(class_id);
CREATE INDEX idx_schedules_class ON schedules(class_id);
CREATE INDEX idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX idx_attendances_student ON attendances(student_id);
CREATE INDEX idx_attendances_schedule ON attendances(schedule_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject_id);
CREATE INDEX idx_grades_academic_year ON grades(academic_year_id);
CREATE INDEX idx_report_cards_student ON report_cards(student_id);
CREATE INDEX idx_violations_student ON violations(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================================================
-- 5. HELPER FUNCTION: Get current user role
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- 6. ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 7. RLS POLICIES - PROFILES
-- =============================================================================
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "profiles_insert_admin" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE USING (public.get_user_role() = 'super_admin');

-- =============================================================================
-- 8. RLS POLICIES - ACADEMIC YEARS
-- =============================================================================
CREATE POLICY "academic_years_select_all" ON public.academic_years
  FOR SELECT USING (true);
CREATE POLICY "academic_years_insert_admin" ON public.academic_years
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "academic_years_update_admin" ON public.academic_years
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "academic_years_delete_admin" ON public.academic_years
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 9. RLS POLICIES - CLASSES
-- =============================================================================
CREATE POLICY "classes_select_all" ON public.classes
  FOR SELECT USING (true);
CREATE POLICY "classes_insert_admin" ON public.classes
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "classes_update_admin" ON public.classes
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "classes_delete_admin" ON public.classes
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 10. RLS POLICIES - STUDENTS
-- =============================================================================
CREATE POLICY "students_select_admin" ON public.students
  FOR SELECT USING (public.get_user_role() IN ('super_admin','admin','kepala_sekolah','waka_kurikulum'));

CREATE POLICY "students_select_teacher" ON public.students
  FOR SELECT USING (
    public.get_user_role() IN ('guru','wali_kelas')
    AND id IN (
      SELECT cs.student_id FROM public.class_students cs
      JOIN public.classes c ON cs.class_id = c.id
      JOIN public.teacher_subjects ts ON ts.class_id = c.id
      WHERE ts.teacher_id = (
        SELECT id FROM public.teachers WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "students_select_own" ON public.students
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "students_select_parent" ON public.students
  FOR SELECT USING (
    public.get_user_role() = 'orang_tua'
    AND id IN (
      SELECT sp.student_id FROM public.student_parents sp
      JOIN public.parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "students_insert_admin" ON public.students
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "students_update_admin" ON public.students
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "students_delete_admin" ON public.students
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 11. RLS POLICIES - TEACHERS
-- =============================================================================
CREATE POLICY "teachers_select_all" ON public.teachers
  FOR SELECT USING (true);
CREATE POLICY "teachers_insert_admin" ON public.teachers
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "teachers_update_admin" ON public.teachers
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "teachers_delete_admin" ON public.teachers
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 12. RLS POLICIES - PARENTS
-- =============================================================================
CREATE POLICY "parents_select_admin" ON public.parents
  FOR SELECT USING (public.get_user_role() IN ('super_admin','admin','kepala_sekolah'));
CREATE POLICY "parents_select_own" ON public.parents
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "parents_select_teacher" ON public.parents
  FOR SELECT USING (
    public.get_user_role() IN ('guru','wali_kelas')
    AND id IN (
      SELECT sp.parent_id FROM public.student_parents sp
      JOIN public.class_students cs ON sp.student_id = cs.student_id
      JOIN public.classes c ON cs.class_id = c.id
      JOIN public.teacher_subjects ts ON ts.class_id = c.id
      WHERE ts.teacher_id = (
        SELECT id FROM public.teachers WHERE profile_id = auth.uid()
      )
    )
  );
CREATE POLICY "parents_insert_admin" ON public.parents
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "parents_update_admin" ON public.parents
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "parents_delete_admin" ON public.parents
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 13. RLS POLICIES - SUBJECTS
-- =============================================================================
CREATE POLICY "subjects_select_all" ON public.subjects
  FOR SELECT USING (true);
CREATE POLICY "subjects_insert_kurikulum" ON public.subjects
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));
CREATE POLICY "subjects_update_kurikulum" ON public.subjects
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));
CREATE POLICY "subjects_delete_kurikulum" ON public.subjects
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));

-- =============================================================================
-- 14. RLS POLICIES - TEACHER_SUBJECTS
-- =============================================================================
CREATE POLICY "teacher_subjects_select_all" ON public.teacher_subjects
  FOR SELECT USING (true);
CREATE POLICY "teacher_subjects_insert_kurikulum" ON public.teacher_subjects
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));
CREATE POLICY "teacher_subjects_update_kurikulum" ON public.teacher_subjects
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));
CREATE POLICY "teacher_subjects_delete_kurikulum" ON public.teacher_subjects
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));

-- =============================================================================
-- 15. RLS POLICIES - SCHEDULES
-- =============================================================================
CREATE POLICY "schedules_select_all" ON public.schedules
  FOR SELECT USING (true);
CREATE POLICY "schedules_insert_kurikulum" ON public.schedules
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));
CREATE POLICY "schedules_update_kurikulum" ON public.schedules
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));
CREATE POLICY "schedules_delete_kurikulum" ON public.schedules
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin','waka_kurikulum'));

-- =============================================================================
-- 16. RLS POLICIES - ATTENDANCES
-- =============================================================================
CREATE POLICY "attendances_select_admin" ON public.attendances
  FOR SELECT USING (public.get_user_role() IN ('super_admin','admin','kepala_sekolah','waka_kurikulum'));

CREATE POLICY "attendances_select_teacher" ON public.attendances
  FOR SELECT USING (
    public.get_user_role() IN ('guru','wali_kelas')
    AND class_id IN (
      SELECT ts.class_id FROM public.teacher_subjects ts
      WHERE ts.teacher_id = (
        SELECT id FROM public.teachers WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "attendances_select_student" ON public.attendances
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.students WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "attendances_select_parent" ON public.attendances
  FOR SELECT USING (
    public.get_user_role() = 'orang_tua'
    AND student_id IN (
      SELECT sp.student_id FROM public.student_parents sp
      JOIN public.parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "attendances_insert_teacher" ON public.attendances
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('guru','wali_kelas','super_admin','admin')
    AND (
      public.get_user_role() IN ('super_admin','admin')
      OR class_id IN (
        SELECT ts.class_id FROM public.teacher_subjects ts
        WHERE ts.teacher_id = (
          SELECT id FROM public.teachers WHERE profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "attendances_update_teacher" ON public.attendances
  FOR UPDATE USING (
    public.get_user_role() IN ('guru','wali_kelas','super_admin','admin')
    AND (
      public.get_user_role() IN ('super_admin','admin')
      OR class_id IN (
        SELECT ts.class_id FROM public.teacher_subjects ts
        WHERE ts.teacher_id = (
          SELECT id FROM public.teachers WHERE profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "attendances_delete_admin" ON public.attendances
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 17. RLS POLICIES - GRADES
-- =============================================================================
CREATE POLICY "grades_select_admin" ON public.grades
  FOR SELECT USING (public.get_user_role() IN ('super_admin','admin','kepala_sekolah','waka_kurikulum'));

CREATE POLICY "grades_select_teacher" ON public.grades
  FOR SELECT USING (
    public.get_user_role() IN ('guru','wali_kelas')
    AND subject_id IN (
      SELECT ts.subject_id FROM public.teacher_subjects ts
      WHERE ts.teacher_id = (
        SELECT id FROM public.teachers WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "grades_select_student" ON public.grades
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.students WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "grades_select_parent" ON public.grades
  FOR SELECT USING (
    public.get_user_role() = 'orang_tua'
    AND student_id IN (
      SELECT sp.student_id FROM public.student_parents sp
      JOIN public.parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "grades_insert_teacher" ON public.grades
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('guru','super_admin','admin')
    AND (
      public.get_user_role() IN ('super_admin','admin')
      OR subject_id IN (
        SELECT ts.subject_id FROM public.teacher_subjects ts
        WHERE ts.teacher_id = (
          SELECT id FROM public.teachers WHERE profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "grades_update_teacher" ON public.grades
  FOR UPDATE USING (
    public.get_user_role() IN ('guru','super_admin','admin')
    AND (
      public.get_user_role() IN ('super_admin','admin')
      OR subject_id IN (
        SELECT ts.subject_id FROM public.teacher_subjects ts
        WHERE ts.teacher_id = (
          SELECT id FROM public.teachers WHERE profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "grades_delete_admin" ON public.grades
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 18. RLS POLICIES - REPORT_CARDS
-- =============================================================================
CREATE POLICY "report_cards_select_admin" ON public.report_cards
  FOR SELECT USING (public.get_user_role() IN ('super_admin','admin','kepala_sekolah','waka_kurikulum'));

CREATE POLICY "report_cards_select_student" ON public.report_cards
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.students WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "report_cards_select_parent" ON public.report_cards
  FOR SELECT USING (
    public.get_user_role() = 'orang_tua'
    AND student_id IN (
      SELECT sp.student_id FROM public.student_parents sp
      JOIN public.parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "report_cards_insert_admin" ON public.report_cards
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "report_cards_update_admin" ON public.report_cards
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "report_cards_delete_admin" ON public.report_cards
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 19. RLS POLICIES - VIOLATIONS
-- =============================================================================
CREATE POLICY "violations_select_admin" ON public.violations
  FOR SELECT USING (public.get_user_role() IN ('super_admin','admin','kepala_sekolah','waka_kurikulum'));

CREATE POLICY "violations_select_teacher" ON public.violations
  FOR SELECT USING (
    public.get_user_role() IN ('guru','wali_kelas')
    AND student_id IN (
      SELECT cs.student_id FROM public.class_students cs
      JOIN public.classes c ON cs.class_id = c.id
      JOIN public.teacher_subjects ts ON ts.class_id = c.id
      WHERE ts.teacher_id = (
        SELECT id FROM public.teachers WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "violations_select_student" ON public.violations
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.students WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "violations_select_parent" ON public.violations
  FOR SELECT USING (
    public.get_user_role() = 'orang_tua'
    AND student_id IN (
      SELECT sp.student_id FROM public.student_parents sp
      JOIN public.parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "violations_insert_teacher" ON public.violations
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('guru','wali_kelas','super_admin','admin')
  );

CREATE POLICY "violations_update_admin" ON public.violations
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));

CREATE POLICY "violations_delete_admin" ON public.violations
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 20. RLS POLICIES - ANNOUNCEMENTS
-- =============================================================================
CREATE POLICY "announcements_select_all" ON public.announcements
  FOR SELECT USING (true);
CREATE POLICY "announcements_insert_admin_guru" ON public.announcements
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin','kepala_sekolah','guru'));
CREATE POLICY "announcements_update_admin" ON public.announcements
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "announcements_delete_admin" ON public.announcements
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 21. RLS POLICIES - NOTIFICATIONS
-- =============================================================================
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete_admin" ON public.notifications
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 22. RLS POLICIES - CLASS_STUDENTS
-- =============================================================================
CREATE POLICY "class_students_select_all" ON public.class_students
  FOR SELECT USING (true);
CREATE POLICY "class_students_insert_admin" ON public.class_students
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin','wali_kelas'));
CREATE POLICY "class_students_update_admin" ON public.class_students
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin','wali_kelas'));
CREATE POLICY "class_students_delete_admin" ON public.class_students
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin','wali_kelas'));

-- =============================================================================
-- 23. RLS POLICIES - STUDENT_PARENTS
-- =============================================================================
CREATE POLICY "student_parents_select_admin" ON public.student_parents
  FOR SELECT USING (public.get_user_role() IN ('super_admin','admin','kepala_sekolah'));
CREATE POLICY "student_parents_select_parent" ON public.student_parents
  FOR SELECT USING (
    parent_id IN (
      SELECT id FROM public.parents WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY "student_parents_insert_admin" ON public.student_parents
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "student_parents_update_admin" ON public.student_parents
  FOR UPDATE USING (public.get_user_role() IN ('super_admin','admin'));
CREATE POLICY "student_parents_delete_admin" ON public.student_parents
  FOR DELETE USING (public.get_user_role() IN ('super_admin','admin'));

-- =============================================================================
-- 24. AUTO-CREATE PROFILE ON USER SIGNUP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'siswa')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
