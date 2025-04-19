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
