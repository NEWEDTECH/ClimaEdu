"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { useProfile } from '@/context/zustand/useProfile';
import { useTutorFollowUp } from '@/hooks/follow-up/useTutorFollowUp';
import { useStudentActivities } from '@/hooks/follow-up/useStudentActivities';
import { StudentListView } from '@/components/follow-up/StudentListView';
import { StudentDetailView } from '@/components/follow-up/StudentDetailView';
import { CourseDetailView } from '@/components/follow-up/CourseDetailView';

export default function AcompanhamentoPage() {
  const { infoUser } = useProfile();
  const tutorId = infoUser.id;
  const institutionId = infoUser.currentIdInstitution;

  const renderCount = useRef(0)
  renderCount.current++
  console.log(`[AcompanhamentoPage] render #${renderCount.current}`, {
    tutorId: tutorId || '(vazio)',
    institutionId: institutionId || '(vazio)',
  })

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState<string | null>(null);

  const { students, courses, loading, error } = useTutorFollowUp(tutorId, institutionId);

  // Log whenever loading state changes
  useEffect(() => {
    console.log(`[AcompanhamentoPage] estado loading mudou → loading=${loading} | alunos=${students.length} | cursos=${courses.length} | erro=${error ?? 'nenhum'}`)
  }, [loading, students.length, courses.length, error])

  const selectedStudent = students.find(s => s.id === selectedStudentId) ?? null;

  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
  } = useStudentActivities(
    selectedStudentId,
    selectedStudent?.name ?? '',
    tutorId,
    institutionId,
    courses
  );

  const selectedCourse = selectedStudent?.enrolledCourses.find(
    c => c.id === selectedCourseId
  ) ?? null;

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedCourseId(null);
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleBackToList = () => {
    setSelectedStudentId(null);
    setSelectedCourseId(null);
  };

  const handleBackToStudentDetail = () => {
    setSelectedCourseId(null);
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {!selectedStudentId && (
            <StudentListView
              students={students}
              courses={courses}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              filterCourse={filterCourse}
              onSearchChange={e => setSearchTerm(e.target.value)}
              onFilterChange={setFilterCourse}
              onStudentSelect={handleStudentSelect}
            />
          )}

          {selectedStudentId && !selectedCourseId && selectedStudent && (
            <StudentDetailView
              student={selectedStudent}
              onBack={handleBackToList}
              onCourseSelect={handleCourseSelect}
            />
          )}

          {selectedStudentId && selectedCourseId && selectedStudent && selectedCourse && (
            <CourseDetailView
              student={selectedStudent}
              course={selectedCourse}
              activities={activities}
              activitiesLoading={activitiesLoading}
              activitiesError={activitiesError}
              onBack={handleBackToStudentDetail}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
