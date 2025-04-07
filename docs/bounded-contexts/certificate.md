# Bounded Context: Certificate

## Context Explanation

The **Certificate** bounded context manages the issuing and verification of certificates for students who successfully complete their courses.

Certificates act as formal, verifiable recognition that a student has achieved the required learning outcomes.  
Each certificate links a specific student to a specific course and is associated with the institution under which the course was completed.

Certificates also include unique identifiers and URLs to allow third parties (such as employers) to verify their authenticity.

Hierarchy of data:

```plaintext
Institution
  └── User
       └── Enrollment (Completed)
            └── Certificate
```

---

## Entities and Responsibilities

| Entity             | Responsibility |
|:-------------------|:----------------|
| **Certificate**    | Represents the official document issued to a student upon successful completion of a course. |

---

## Key Attributes (Functional Description)

- **Certificate.userId**: Identifies the student who earned the certificate.
- **Certificate.courseId**: Links the certificate to the completed course.
- **Certificate.institutionId**: Identifies the institution issuing the certificate.
- **Certificate.issuedAt**: Timestamp when the certificate was officially issued.
- **Certificate.certificateNumber**: A globally unique number that allows verification of the certificate's authenticity.
- **Certificate.certificateUrl**: A public URL where the certificate can be viewed or downloaded.

---

## Business Rules

- A Certificate can only be issued if the associated Enrollment is in **COMPLETED** status.
- Each Certificate must have a **unique certificate number** across the entire platform to ensure easy and secure validation.
- The **certificate URL** must be accessible publicly for validation and sharing purposes.
- Institutions may customize certificate templates (future feature) but the core data (student, course, date, institution) must always be present.
- Certificates must remain immutable after issuance to preserve the integrity of student achievements.