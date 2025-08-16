# Tutoring Subject Correction Checklist

## ✅ COMPLETED TASKS

### 1. Core Module Cleanup
- [x] Removed Subject entity (`src/_core/modules/tutoring/core/entities/Subject.ts`)
- [x] Removed SubjectRepository interface (`src/_core/modules/tutoring/infrastructure/repositories/SubjectRepository.ts`)
- [x] Removed FirebaseSubjectRepository implementation (`src/_core/modules/tutoring/infrastructure/repositories/implementations/FirebaseSubjectRepository.ts`)
- [x] Removed GetAvailableSubjectsUseCase folder (`src/_core/modules/tutoring/core/use-cases/shared/get-available-subjects/`)

### 2. New Use Case Implementation
- [x] Created GetStudentEnrolledCoursesUseCase
  - [x] Input interface (`get-student-enrolled-courses.input.ts`)
  - [x] Output interface (`get-student-enrolled-courses.output.ts`)
  - [x] Use case implementation (`get-student-enrolled-courses.use-case.ts`)

### 3. Container DI Updates
- [x] Updated symbols.ts to remove Subject references
- [x] Added GetStudentEnrolledCoursesUseCase symbol
- [x] Updated register.ts to remove Subject repository binding
- [x] Added GetStudentEnrolledCoursesUseCase binding

### 4. Module Exports
- [x] Updated tutoring module index.ts
- [x] Removed Subject entity export
- [x] Removed Subject repository exports
- [x] Added new use case exports

### 5. Frontend Updates
- [x] Created new hook `useStudentEnrolledCourses.ts`
- [x] Updated hooks index.ts to export new hook
- [x] Removed old `useAvailableSubjects.ts` hook
- [x] Updated student tutoring page to use new hook
- [x] Updated TutoringScheduleForm component:
  - [x] Changed interface to accept Course[] instead of Subject[]
  - [x] Updated all references from subjects to courses
  - [x] Fixed property names (name -> title for Course entity)

## ✅ COMPLETED TASKS (CONTINUED)

### 6. Schedule Session Logic
- [x] Updated ScheduleTutoringSessionUseCase to remove subjectId parameter
- [x] Updated TutoringSession entity to remove subjectId field
- [x] Updated all related input/output interfaces
- [x] Fixed ScheduleTutoringSessionInput interface
- [x] Updated useTutoringScheduler hook
- [x] Updated TutoringScheduleForm component

### 7. Container DI Error Fix
- [x] Fixed "Unexpected undefined service id type" error
- [x] Removed SubjectRepository dependency from ScheduleTutoringSessionUseCase
- [x] Updated all use case calls to remove subjectId

## ✅ COMPLETED TASKS (FINAL)

### 8. Firebase Repository Fixes
- [x] Fixed FirebaseTutoringSessionRepository.mapToFirestoreData() - removed subjectId
- [x] Fixed FirebaseTutoringSessionRepository.mapToEntity() - removed subjectId parameter
- [x] Removed findBySubjectId() method from repository interface and implementation
- [x] Fixed GetSessionDetailsUseCase - removed SubjectRepository dependency
- [x] Updated GetSessionDetailsOutput interface - removed Subject field
- [x] Cleaned TutoringConfig - removed Subject-related error messages

### 9. Final Cleanup & Validation
- [x] All TypeScript compilation errors resolved (npx tsc --noEmit --skipLibCheck passed)
- [x] All Subject references removed from tutoring module
- [x] Firebase error "Unsupported field value: undefined (found in field subjectId)" should be resolved
- [x] Container DI errors completely fixed

## 🔄 REMAINING TASKS

### 10. Final Testing
- [ ] Test tutoring session scheduling end-to-end
- [ ] Verify Firebase save operations work without subjectId errors
- [ ] Confirm enrollment integration works correctly

## 📋 BUSINESS LOGIC CORRECTION SUMMARY

**BEFORE (❌ INCORRECT):**
- Student selected from abstract "subjects" 
- GetAvailableSubjectsUseCase returned generic subjects
- No connection to actual student enrollments

**AFTER (✅ CORRECT):**
- Student selects from courses they are actually enrolled in
- GetStudentEnrolledCoursesUseCase uses EnrollmentRepository
- Integrates with existing enrollment and content modules
- Follows proper business domain boundaries

## 🎯 NEXT STEPS
1. Complete remaining tasks in schedule session logic
2. Update form fields and validation
3. Test the complete flow
4. Clean up any remaining Subject references
