-- =============================================================================
-- RLS (Row Level Security) Policies for SIAKAD SMANELA
-- =============================================================================
-- This migration enables RLS on all tables and creates policies based on roles.
-- Roles: super_admin, admin, kepala_sekolah, waka_kurikulum, guru, wali_kelas, siswa, orang_tua
-- =============================================================================

-- =============================================================================
-- 1. HELPER FUNCTION: Get current user's role
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- 2. ENABLE RLS ON ALL TABLES
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
-- 3. PROFILES TABLE
-- =============================================================================
-- Users can read their own profile, admins can read/write all
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "profiles_insert_admin" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE USING (public.get_user_role() = 'super_admin');

-- =============================================================================
-- 4. ACADEMIC YEARS TABLE
-- =============================================================================
-- Everyone can read, admins/super_admin can manage
CREATE POLICY "academic_years_select_all" ON public.academic_years
  FOR SELECT USING (true);

CREATE POLICY "academic_years_insert_admin" ON public.academic_years
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "academic_years_update_admin" ON public.academic_years
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "academic_years_delete_admin" ON public.academic_years
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 5. CLASSES TABLE
-- =============================================================================
-- Everyone can read, admins manage, wali_kelas can view their class
CREATE POLICY "classes_select_all" ON public.classes
  FOR SELECT USING (true);

CREATE POLICY "classes_insert_admin" ON public.classes
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "classes_update_admin" ON public.classes
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "classes_delete_admin" ON public.classes
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 6. STUDENTS TABLE
-- =============================================================================
-- Admins/teachers can read all, students can read own, parents can read children
CREATE POLICY "students_select_admin" ON public.students
  FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin', 'kepala_sekolah', 'waka_kurikulum'));

CREATE POLICY "students_select_teacher" ON public.students
  FOR SELECT USING (
    public.get_user_role() IN ('guru', 'wali_kelas')
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
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "students_update_admin" ON public.students
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "students_delete_admin" ON public.students
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 7. TEACHERS TABLE
-- =============================================================================
-- Everyone can read, admins can manage
CREATE POLICY "teachers_select_all" ON public.teachers
  FOR SELECT USING (true);

CREATE POLICY "teachers_insert_admin" ON public.teachers
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "teachers_update_admin" ON public.teachers
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "teachers_delete_admin" ON public.teachers
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 8. PARENTS TABLE
-- =============================================================================
-- Admins can read all, parents can read own, teachers can read parents of their students
CREATE POLICY "parents_select_admin" ON public.parents
  FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin', 'kepala_sekolah'));

CREATE POLICY "parents_select_own" ON public.parents
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "parents_select_teacher" ON public.parents
  FOR SELECT USING (
    public.get_user_role() IN ('guru', 'wali_kelas')
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
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "parents_update_admin" ON public.parents
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "parents_delete_admin" ON public.parents
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 9. SUBJECTS TABLE
-- =============================================================================
-- Everyone can read, waka_kurikulum/admin can manage
CREATE POLICY "subjects_select_all" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "subjects_insert_kurikulum" ON public.subjects
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

CREATE POLICY "subjects_update_kurikulum" ON public.subjects
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

CREATE POLICY "subjects_delete_kurikulum" ON public.subjects
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

-- =============================================================================
-- 10. TEACHER_SUBJECTS TABLE
-- =============================================================================
-- Everyone can read, waka_kurikulum/admin can manage
CREATE POLICY "teacher_subjects_select_all" ON public.teacher_subjects
  FOR SELECT USING (true);

CREATE POLICY "teacher_subjects_insert_kurikulum" ON public.teacher_subjects
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

CREATE POLICY "teacher_subjects_update_kurikulum" ON public.teacher_subjects
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

CREATE POLICY "teacher_subjects_delete_kurikulum" ON public.teacher_subjects
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

-- =============================================================================
-- 11. SCHEDULES TABLE
-- =============================================================================
-- Everyone can read, only waka_kurikulum/admin can modify
CREATE POLICY "schedules_select_all" ON public.schedules
  FOR SELECT USING (true);

CREATE POLICY "schedules_insert_kurikulum" ON public.schedules
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

CREATE POLICY "schedules_update_kurikulum" ON public.schedules
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

CREATE POLICY "schedules_delete_kurikulum" ON public.schedules
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin', 'waka_kurikulum'));

-- =============================================================================
-- 12. ATTENDANCES TABLE
-- =============================================================================
-- Teachers can CRUD for their classes, students/parents can read own
CREATE POLICY "attendances_select_admin" ON public.attendances
  FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin', 'kepala_sekolah', 'waka_kurikulum'));

CREATE POLICY "attendances_select_teacher" ON public.attendances
  FOR SELECT USING (
    public.get_user_role() IN ('guru', 'wali_kelas')
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
    public.get_user_role() IN ('guru', 'wali_kelas', 'super_admin', 'admin')
    AND (
      public.get_user_role() IN ('super_admin', 'admin')
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
    public.get_user_role() IN ('guru', 'wali_kelas', 'super_admin', 'admin')
    AND (
      public.get_user_role() IN ('super_admin', 'admin')
      OR class_id IN (
        SELECT ts.class_id FROM public.teacher_subjects ts
        WHERE ts.teacher_id = (
          SELECT id FROM public.teachers WHERE profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "attendances_delete_admin" ON public.attendances
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 13. GRADES TABLE
-- =============================================================================
-- Teachers can CRUD for their subjects, students/parents can read own
CREATE POLICY "grades_select_admin" ON public.grades
  FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin', 'kepala_sekolah', 'waka_kurikulum'));

CREATE POLICY "grades_select_teacher" ON public.grades
  FOR SELECT USING (
    public.get_user_role() IN ('guru', 'wali_kelas')
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
    public.get_user_role() IN ('guru', 'super_admin', 'admin')
    AND (
      public.get_user_role() IN ('super_admin', 'admin')
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
    public.get_user_role() IN ('guru', 'super_admin', 'admin')
    AND (
      public.get_user_role() IN ('super_admin', 'admin')
      OR subject_id IN (
        SELECT ts.subject_id FROM public.teacher_subjects ts
        WHERE ts.teacher_id = (
          SELECT id FROM public.teachers WHERE profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "grades_delete_admin" ON public.grades
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 14. REPORT_CARDS TABLE
-- =============================================================================
-- Admins can manage, students/parents can read own
CREATE POLICY "report_cards_select_admin" ON public.report_cards
  FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin', 'kepala_sekolah', 'waka_kurikulum'));

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
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "report_cards_update_admin" ON public.report_cards
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "report_cards_delete_admin" ON public.report_cards
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 15. VIOLATIONS TABLE
-- =============================================================================
-- Teachers can input violations, students/parents can read own, admins can manage
CREATE POLICY "violations_select_admin" ON public.violations
  FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin', 'kepala_sekolah', 'waka_kurikulum'));

CREATE POLICY "violations_select_teacher" ON public.violations
  FOR SELECT USING (
    public.get_user_role() IN ('guru', 'wali_kelas')
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
    public.get_user_role() IN ('guru', 'wali_kelas', 'super_admin', 'admin')
  );

CREATE POLICY "violations_update_admin" ON public.violations
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "violations_delete_admin" ON public.violations
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 16. ANNOUNCEMENTS TABLE
-- =============================================================================
-- Everyone can read, only admins/guru can create
CREATE POLICY "announcements_select_all" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "announcements_insert_admin_guru" ON public.announcements
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin', 'kepala_sekolah', 'guru'));

CREATE POLICY "announcements_update_admin" ON public.announcements
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "announcements_delete_admin" ON public.announcements
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 17. NOTIFICATIONS TABLE
-- =============================================================================
-- Users can only read their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_admin" ON public.notifications
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- 18. CLASS_STUDENTS TABLE
-- =============================================================================
-- Everyone can read, admins manage
CREATE POLICY "class_students_select_all" ON public.class_students
  FOR SELECT USING (true);

CREATE POLICY "class_students_insert_admin" ON public.class_students
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin', 'wali_kelas'));

CREATE POLICY "class_students_update_admin" ON public.class_students
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin', 'wali_kelas'));

CREATE POLICY "class_students_delete_admin" ON public.class_students
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin', 'wali_kelas'));

-- =============================================================================
-- 19. STUDENT_PARENTS TABLE
-- =============================================================================
-- Admins can manage, parents can read own relationships
CREATE POLICY "student_parents_select_admin" ON public.student_parents
  FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin', 'kepala_sekolah'));

CREATE POLICY "student_parents_select_parent" ON public.student_parents
  FOR SELECT USING (
    parent_id IN (
      SELECT id FROM public.parents WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "student_parents_insert_admin" ON public.student_parents
  FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "student_parents_update_admin" ON public.student_parents
  FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "student_parents_delete_admin" ON public.student_parents
  FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin'));

-- =============================================================================
-- DONE
-- =============================================================================
