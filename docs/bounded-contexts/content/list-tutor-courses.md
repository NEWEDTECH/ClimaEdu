# List Tutor Courses Use Case

## Overview

The **List Tutor Courses Use Case** is responsible for retrieving a list of all courses associated with a specific tutor within an institution.

## Target Audience

-   **Frontend**: To display a list of courses for a tutor.
-   **Backend**: To be used by other use cases that need to list courses for a tutor.

## Data Sources

-   **CourseTutor**: To find the relationship between tutors and courses.
-   **Course**: To retrieve the details of the courses.

## Input

```typescript
export interface ListTutorCoursesInput {
  tutorId: string;
  institutionId: string;
}
```

## Output

```typescript
import { Course } from '../../entities/Course';

export interface ListTutorCoursesOutput {
  courses: Course[];
}
```

## Use Cases

### 1. Displaying a list of courses for a tutor

```typescript
const useCase = container.get<ListTutorCoursesUseCase>(ListTutorCoursesUseCase);
const result = await useCase.execute({
  tutorId: 'tutor-123',
  institutionId: 'institution-456',
});

// result.courses will contain a list of Course entities
