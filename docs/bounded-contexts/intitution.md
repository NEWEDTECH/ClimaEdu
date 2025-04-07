# Bounded Context: Institution

## Context Explanation

The **Institution** bounded context manages the organizational structure within the platform.  
Each institution represents an independent organization (such as a school, company, or training center) using the platform in a multi-tenant environment.

Institutions own and manage their own users, courses, certificates, and reports, completely isolated from other institutions.  
This ensures that data privacy, customization, and management are properly maintained for each client.

Institutions can personalize their environment visually, adjusting logos, colors, and even domains to create a white-label experience.

Hierarchy of data:

```plaintext
Institution
  ├── Users (Students, Tutors, Admins)
  ├── Courses
  ├── Enrollments
  ├── Certificates
  ├── Reports
  └── InstitutionSettings
```

---

## Entities and Responsibilities

| Entity                  | Responsibility |
|:-------------------------|:----------------|
| **Institution**          | Represents a customer organization managing its own ecosystem inside the platform. |
| **InstitutionSettings**  | Contains optional visual customizations such as logo and branding colors. |

---

## Key Attributes (Functional Description)

- **Institution.name**: Identifies the organization using the platform.
- **Institution.domain**: Defines a custom access point (e.g., `institution1.platform.com`).
- **Institution.settings**: Allows the institution to configure branding elements like logos and colors.
- **Institution.createdAt**: Timestamp marking when the institution account was created.
- **Institution.updatedAt**: Timestamp for the latest change to the institution's configuration.

- **InstitutionSettings.logoUrl**: URL pointing to the institution’s custom logo.
- **InstitutionSettings.primaryColor**: Primary branding color for the institution’s interface.
- **InstitutionSettings.secondaryColor**: Secondary branding color for additional UI elements.

---

## Business Rules

- Every User, Course, Enrollment, and Certificate must be linked to a specific Institution.
- Institutions operate in full isolation: users from one institution cannot interact with or see users or data from another institution.
- Institutions can customize visual elements such as logos and colors to match their branding.
- Institutions may optionally configure a custom domain for their users' access.
- Institution settings can be updated at any time without affecting historical user data.