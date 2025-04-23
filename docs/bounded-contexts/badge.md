# Bounded Context: Badges

## Context Explanation

The **Badges** bounded context manages the gamification system of the platform.  
It rewards students for achieving specific educational milestones, encouraging greater engagement, continuous learning, and a sense of accomplishment.

Badges are earned automatically based on the student's activities and performance, such as completing courses, passing assessments, or maintaining study habits.

Each badge represents a tangible achievement and can be displayed on the student's profile, shared externally, and used to motivate ongoing participation.

Hierarchy of data:

```plaintext
Institution
  └── User
       └── StudentBadge
            └── Badge
```

---

## Entities and Responsibilities

| Entity            | Responsibility |
|:------------------|:----------------|
| **Badge**         | Defines the available achievements students can earn, along with their criteria. |
| **StudentBadge**  | Records the event of a student earning a specific Badge. |
| **BadgeCriteriaType** (Enum) | Classifies the type of achievement required to earn a Badge (e.g., course completion, daily login). |

---

## Key Attributes (Functional Description)

- **Badge.name**: Title of the badge that identifies the achievement (e.g., "First Course Completed").
- **Badge.description**: A short explanation of what the badge represents and how it was earned.
- **Badge.iconUrl**: Link to an image representing the badge visually.
- **Badge.criteriaType**: Defines the type of activity that needs to be completed to earn the badge (e.g., COURSE_COMPLETION, DAILY_LOGIN).
- **Badge.criteriaValue**: Numeric threshold defining when the badge is awarded (e.g., complete 5 courses).
- **StudentBadge.userId**: The student who earned the badge.
- **StudentBadge.badgeId**: Links the earned badge to the original Badge definition.
- **StudentBadge.awardedAt**: Date and time when the badge was officially awarded.

---

## Business Rules

- **Badges are awarded automatically** when students meet the configured criteria.
- Badge assignment is based on tracked educational activities, such as:
  - Completing a number of courses.
  - Achieving a certain number of daily logins.
  - Passing a set number of questionnaires.
  - Completing lessons or earning certificates.
- Students cannot manually request or reject badges.
- Badges must be **immutable once awarded** to ensure the credibility of student achievements.
- Institutions may choose to customize which badges are active for their users (future enhancement).
- Badges contribute to a student's profile and can be displayed in dashboards, profiles, or shared externally.

---

## Badge Criteria Types (BadgeCriteriaType Enum)

| Criteria Type        | Description |
|:---------------------|:------------|
| **COURSE_COMPLETION** | Earned by completing a defined number of courses. |
| **QUESTIONNAIRE_COMPLETION** | Earned by completing a defined number of questionnaires. |
| **DAILY_LOGIN**       | Earned by logging into the platform consistently over several days. |
| **LESSON_COMPLETION** | Earned by completing a certain number of lessons. |
| **CERTIFICATE_ACHIEVED** | Earned by receiving a defined number of certificates.

---

## Flow of Achievement

```plaintext
Student progresses through activities ➔
System tracks achievements ➔
Criteria evaluation logic runs ➔
StudentBadge is created if criteria are met ➔
Student is notified and Badge is displayed in their profile.
```

---

# ✅ **Badges Context concluído!**

Documentado com o nível de detalhes que garante total entendimento para qualquer dev ou PO que leia! 🚀

---

## Use Cases

### ViewEarnedBadgesUseCase

**Purpose**: Retrieves all badges earned by a student with detailed information.

**Inputs**:
- `userId`: The ID of the student whose badges are being viewed
- `institutionId`: The ID of the institution context

**Process**:
1. Verifies that the user exists
2. Retrieves all badges earned by the user with their details
3. Calculates statistics such as total badges earned and recently earned badges
4. Returns the list of earned badges with their details and statistics

**Business Rules**:
- User must exist
- Recently earned badges are those awarded within the last 7 days
- Each earned badge includes both the StudentBadge record and the Badge details

---

# 🏁 **Resumo**

Você agora tem a documentação de TODOS os seus **Bounded Contexts**:

| Contexto | Status |
|:---------|:-------|
| User | ✅ Completo |
| Institution | ✅ Completo |
| Content | ✅ Completo |
| Enrollment | ✅ Completo |
| Certificate | ✅ Completo |
| Reports | ✅ Completo |
| Badges | ✅ Completo |
