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
| **UserInstitution**      | Represents the association between a user and an institution. |

---

## Key Attributes (Functional Description)

- **Institution.name**: Identifies the organization using the platform.
- **Institution.domain**: Defines a custom access point (e.g., `institution1.platform.com`).
- **Institution.settings**: Allows the institution to configure branding elements like logos and colors.
- **Institution.createdAt**: Timestamp marking when the institution account was created.
- **Institution.updatedAt**: Timestamp for the latest change to the institution's configuration.

- **InstitutionSettings.logoUrl**: URL pointing to the institution's custom logo.
- **InstitutionSettings.primaryColor**: Primary branding color for the institution's interface.
- **InstitutionSettings.secondaryColor**: Secondary branding color for additional UI elements.

- **UserInstitution.userId**: The ID of the user associated with the institution.
- **UserInstitution.institutionId**: The ID of the institution the user is associated with.

---

## Business Rules

- Every User, Course, Enrollment, and Certificate must be linked to a specific Institution.
- Institutions operate in full isolation: users from one institution cannot interact with or see users or data from another institution.
- Institutions can customize visual elements such as logos and colors to match their branding.
- Institutions may optionally configure a custom domain for their users' access.
- Institution settings can be updated at any time without affecting historical user data.
- A user can be associated with only one institution.
- When a user is associated as an administrator to an institution, their role is automatically updated to ADMINISTRATOR if it wasn't already.

---

## Use Cases

### CreateInstitutionUseCase

**Purpose**: Creates a new institution with basic configuration.

**Inputs**:
- `name`: The name of the institution
- `domain`: The domain for the institution (must be unique)
- `settings` (optional): Visual customization settings
  - `logoUrl` (optional): URL to the institution's logo
  - `primaryColor` (optional): Primary branding color
  - `secondaryColor` (optional): Secondary branding color

**Process**:
1. Validates that no institution exists with the provided domain
2. Creates InstitutionSettings value object if settings are provided
3. Creates a new Institution entity with the provided data
4. Returns the created Institution

**Business Rules**:
- Institution domain must be unique across the system
- Domain must follow valid domain format
- Institution name cannot be empty

### UpdateInstitutionSettingsUseCase

**Purpose**: Updates the visual customization settings for an existing institution.

**Inputs**:
- `institutionId`: The ID of the institution to update
- `settings`: The settings to update
  - `logoUrl` (optional): URL to the institution's logo
  - `primaryColor` (optional): Primary branding color
  - `secondaryColor` (optional): Secondary branding color

**Process**:
1. Finds the institution by ID
2. Creates a new InstitutionSettings value object with updated values
   (preserving existing values for any settings not explicitly provided)
3. Updates the institution with the new settings
4. Returns the updated Institution

**Business Rules**:
- Institution must exist
- Only specified settings are updated; other settings retain their current values
- Settings are immutable; updates create a new settings object

### AssociateUserToInstitutionUseCase

**Purpose**: Associates a user with an institution, creating a relationship between them.

**Inputs**:
- `userId`: The ID of the user to associate
- `institutionId`: The ID of the institution to associate the user with

**Process**:
1. Verifies that the user exists
2. Verifies that the institution exists
3. Checks if the association already exists
4. If the association doesn't exist, creates a new UserInstitution entity
5. Returns the UserInstitution entity

**Business Rules**:
- User must exist
- Institution must exist
- A user can only be associated with one institution
- If the association already exists, the existing association is returned

### AssociateAdministratorUseCase

**Purpose**: Associates a user as an administrator to an institution, ensuring the user has the ADMINISTRATOR role.

**Inputs**:
- `userId`: The ID of the user to associate as an administrator
- `institutionId`: The ID of the institution to associate the administrator with

**Process**:
1. Verifies that the user exists
2. Verifies that the institution exists
3. Checks if the user has the ADMINISTRATOR role
4. If not, updates the user's role to ADMINISTRATOR
5. Checks if the association already exists
6. If the association doesn't exist, creates a new UserInstitution entity
7. Returns the UserInstitution entity

**Business Rules**:
- User must exist
- Institution must exist
- The user's role is automatically updated to ADMINISTRATOR if it wasn't already
- A user can only be associated with one institution
- If the association already exists, the existing association is returned

### ListUserInstitutionsUseCase

**Purpose**: Retrieves a list of institutions that a user belongs to.

**Inputs**:
- `userId`: The ID of the user to list institutions for

**Process**:
1. Verifies that the user exists
2. Finds all user-institution associations for the user
3. For each association, retrieves the corresponding institution details
4. Returns a list of institutions

**Business Rules**:
- User must exist
- If the user is not associated with any institutions, an empty list is returned
- Only active and valid institutions are included in the results
