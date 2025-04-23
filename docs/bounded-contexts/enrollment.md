# Bounded Context: Enrollment

## Context Explanation

The **Enrollment** bounded context manages the relationship between students and the courses they are registered for.  
It tracks the student's enrollment lifecycle — from the initial registration to completion or cancellation — and acts as the foundational link for accessing course content and issuing certificates.

Enrollment status drives permissions: a student must be enrolled and active in a course to access its lessons, complete assessments, and earn certificates.

Hierarchy of data:

```plaintext
Institution
  └── User
       └── Enrollment
            └── Course
```

---

## Entities and Responsibilities

| Entity             | Responsibility |
|:-------------------|:----------------|
| **Enrollment**     | Represents the act of a student registering for a specific course, and tracks their enrollment status. |
| **EnrollmentStatus** (Enum) | Defines the current state of the enrollment (ENROLLED, COMPLETED, CANCELLED). |

---

## Key Attributes (Functional Description)

- **Enrollment.userId**: Links the enrollment to the student.
- **Enrollment.courseId**: Links the enrollment to the specific course.
- **Enrollment.status**: Tracks whether the student is currently enrolled, completed, or cancelled.
- **Enrollment.enrolledAt**: Date and time the student enrolled in the course.
- **Enrollment.completedAt**: Date when the student completed the course, if applicable.

- **EnrollmentStatus.ENROLLED**: Indicates the student is actively participating in the course.
- **EnrollmentStatus.COMPLETED**: Indicates the student successfully finished the course requirements.
- **EnrollmentStatus.CANCELLED**: Indicates the enrollment was terminated, either by the student or institution.

---

## Use Cases

| Use Case | Description |
|:---------|:------------|
| **EnrollInCourse** | Enrolls a user in a specific course, creating a new enrollment record with ENROLLED status. |
| **CancelEnrollment** | Cancels an existing enrollment, changing its status to CANCELLED. |
| **ListEnrollments** | Retrieves a list of enrollments based on filters like user ID, course ID, and enrollment status. |

---

## Business Rules

- A User must have an **active Enrollment** to access Lessons and Content of a Course.
- When a student **completes all course requirements** (e.g., lessons, assessments), the Enrollment status transitions to **COMPLETED**.
- Certificates can only be issued to students with a **COMPLETED** Enrollment.
- Enrollment can be **cancelled** voluntarily (by the student or admin) or automatically (due to inactivity or administrative actions).
- Institutions may define policies regarding enrollment cancellation, reactivation, or expiration.
- Each Enrollment must be associated with an Institution to maintain tenant isolation.
