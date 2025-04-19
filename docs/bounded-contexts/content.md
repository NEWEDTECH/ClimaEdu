# Bounded Context: Content

## Context Explanation

The **Content** bounded context is responsible for managing the creation, organization, delivery, and evaluation of educational materials within the platform.

Educational content is structured hierarchically into **Courses**, **Modules**, and **Lessons**.  
Each Lesson contains **Content** (e.g., videos, PDFs, podcasts) and may also include interactive elements such as **Activities** (tasks) and **Questionnaires** (quizzes or tests).

Students progress sequentially through Lessons and are evaluated based on their performance in Activities and Questionnaires.  
Completion of content and evaluations directly impacts progression, badge awards, and certificate issuance.

Hierarchy of data:

```plaintext
Institution
  └── Course
       └── Module
            └── Lesson
                 ├── Content
                 ├── Activity (optional)
                 └── Questionnaire (optional)
                      └── QuestionnaireSubmission
                           └── QuestionSubmission
```

---

## Entities and Responsibilities

| Entity                  | Responsibility |
|:-------------------------|:----------------|
| **Course**               | Represents a complete learning path, grouping multiple Modules. |
| **Module**               | Logical grouping of Lessons within a Course. |
| **Lesson**               | Individual unit of study containing content, and optionally, assessments. |
| **Content**              | Educational material attached to a Lesson (Video, PDF, Podcast). |
| **Activity**             | Practical exercise or task linked to a Lesson. |
| **Questionnaire**        | Set of questions designed to assess student learning after a Lesson. |
| **Question**             | A single multiple-choice question inside a Questionnaire. |
| **QuestionnaireSubmission** | A student's attempt at completing a Questionnaire. |
| **QuestionSubmission**   | A student's individual answer to a Question within a QuestionnaireSubmission. |

---

## Key Attributes (Functional Description)

- **Course.title**: Name displayed to students, identifying the learning path.
- **Module.order**: Numeric position of a Module within a Course for structured progression.
- **Lesson.title**: Title of the learning unit inside a Module.
- **Content.type**: Type of material (Video, PDF, Podcast) provided in the Lesson.
- **Activity.instructions**: Detailed guidance about what the student must perform or submit.
- **Questionnaire.title**: The name of the quiz or evaluation associated with a Lesson.
- **Question.correctAnswerIndex**: Index of the correct option among multiple choices for automatic evaluation.
- **QuestionnaireSubmission.score**: Final score (percentage 0–100%) achieved by the student.
- **QuestionnaireSubmission.passed**: Whether the student passed based on the required minimum score.
- **QuestionSubmission.isCorrect**: Indicates if the selected answer was correct.

---

## Business Rules

- A **Course** must contain at least one **Module** to be published.
- A **Module** must contain at least one **Lesson**.
- A **Lesson** may have multiple **Content** items and may optionally have an **Activity** and/or **Questionnaire**.
- Students must complete Lessons sequentially to unlock subsequent content.
- **Activities** can be completed optionally but may be mandatory based on course configuration.
- **Questionnaires** evaluate the student's knowledge and produce a **score**.
- Each **QuestionnaireSubmission** records an attempt with calculated score and pass/fail status.
- Students may be allowed multiple attempts on a **Questionnaire**, depending on institutional or course rules.
- Certificates can only be issued if the student passes the required Questionnaires with the minimum score defined.

---

## Use Cases

### CreateCourseUseCase

**Purpose**: Creates a new course with basic information.

**Inputs**:
- `institutionId`: The ID of the institution that owns the course
- `title`: The title of the course
- `description`: A detailed description of the course

**Process**:
1. Creates a new Course entity with the provided data
2. Returns the created Course

**Business Rules**:
- Course title cannot be empty
- Course description cannot be empty
- Institution ID must be valid

### UpdateCourseUseCase

**Purpose**: Updates an existing course's information.

**Inputs**:
- `id`: The ID of the course to update
- `title` (optional): The new title for the course
- `description` (optional): The new description for the course

**Process**:
1. Finds the course by ID
2. Updates only the fields that are provided in the input
3. Returns the updated Course

**Business Rules**:
- Course must exist
- If title is provided, it cannot be empty
- If description is provided, it cannot be empty
- Only specified fields are updated; other fields retain their current values

### CreateModuleUseCase

**Purpose**: Creates a new module within a course.

**Inputs**:
- `courseId`: The ID of the course that the module belongs to
- `title`: The title of the module
- `order`: The position of the module within the course

**Process**:
1. Verifies that the course exists
2. Creates a new Module entity with the provided data
3. Returns the created Module

**Business Rules**:
- Course must exist
- Module title cannot be empty
- Module order must be a non-negative number

### CreateLessonUseCase

**Purpose**: Creates a new lesson within a module.

**Inputs**:
- `moduleId`: The ID of the module that the lesson belongs to
- `title`: The title of the lesson
- `order` (optional): The position of the lesson within the module

**Process**:
1. Verifies that the module exists
2. If order is provided:
   - Reorders existing lessons to make room for the new one
   - Creates the lesson at the specified position
3. If order is not provided:
   - Counts existing lessons in the module
   - Creates the lesson at the end of the sequence
4. Returns the created Lesson

**Business Rules**:
- Module must exist
- Lesson title cannot be empty
- If order is provided, it must be a non-negative number
- When a lesson is inserted at a specific position, other lessons are automatically reordered

### AddContentToLessonUseCase

**Purpose**: Adds educational content to an existing lesson.

**Inputs**:
- `lessonId`: The ID of the lesson to add content to
- `type`: The type of content (VIDEO, PDF, PODCAST)
- `title`: The title of the content
- `url`: The URL where the content is stored

**Process**:
1. Verifies that the lesson exists
2. Creates a new Content entity with the provided data
3. Adds the content to the lesson in memory using the entity's method
4. Persists the complete lesson entity
5. Returns both the created content and the updated lesson

**Business Rules**:
- Lesson must exist
- Content title cannot be empty
- Content URL cannot be empty
- Content type must be one of the predefined types (VIDEO, PDF, PODCAST)

### CreateActivityUseCase

**Purpose**: Creates an activity for a lesson.

**Inputs**:
- `lessonId`: The ID of the lesson to add the activity to
- `description`: A description of the activity
- `instructions`: Detailed instructions for completing the activity
- `resourceUrl` (optional): URL to any resources needed for the activity

**Process**:
1. Verifies that the lesson exists
2. Checks if the lesson already has an activity (only one activity per lesson is allowed)
3. Creates a new Activity entity with the provided data
4. Attaches the activity to the lesson in memory using the entity's method
5. Persists the complete lesson entity
6. Returns both the created activity and the updated lesson

**Business Rules**:
- Lesson must exist
- A lesson can have at most one activity
- Activity description cannot be empty
- Activity instructions cannot be empty
