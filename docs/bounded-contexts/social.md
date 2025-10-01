# Bounded Context: Social

## Context Explanation

The **Social** bounded context is responsible for managing social interactions and community engagement within the educational platform. It enables users to create, share, and interact with content through posts, comments, and likes, fostering a collaborative learning environment similar to platforms like Medium.com.

The social system is built around **Posts** as the primary content unit, which can receive **Comments** (including nested replies) and **Likes** from other users. Each interaction is tracked with authorship and timestamps to maintain engagement history and enable moderation.

All social interactions are scoped to institutions, ensuring that users only interact with content from their own educational community while maintaining data isolation and privacy.

Hierarchy of data:

```plaintext
Institution
  └── Post
       ├── PostLike
       └── Comment
            ├── CommentLike
            └── Comment (Reply - 1 level only)
                 └── CommentLike
```

---

## Entities and Responsibilities

| Entity                  | Responsibility |
|:-------------------------|:----------------|
| **Post**                 | Represents the main content unit with title, content, and lifecycle management (DRAFT → PUBLISHED → ARCHIVED). |
| **Comment**              | Represents user feedback on posts, supporting one level of nested replies for threaded discussions. |
| **PostLike**             | Represents a user's appreciation for a post, ensuring unique likes per user per post. |
| **CommentLike**          | Represents a user's appreciation for a comment, ensuring unique likes per user per comment. |

---

## Key Attributes (Functional Description)

### Post Entity
- **Post.id**: Unique identifier with prefix `pst_` following project conventions.
- **Post.authorId**: ID of the user who created the post.
- **Post.institutionId**: ID of the institution where the post belongs, ensuring data isolation.
- **Post.title**: The title of the post, displayed prominently in feeds and detail views.
- **Post.content**: The main body content of the post, supporting rich text formatting.
- **Post.status**: Current lifecycle state (DRAFT, PUBLISHED, ARCHIVED) controlling visibility and editability.
- **Post.createdAt**: Timestamp when the post was initially created.
- **Post.updatedAt**: Timestamp of the last modification to the post content.
- **Post.publishedAt**: Timestamp when the post was published (null for drafts and archived posts).

### Comment Entity
- **Comment.id**: Unique identifier with prefix `cmt_` following project conventions.
- **Comment.postId**: ID of the post this comment belongs to.
- **Comment.parentCommentId**: ID of the parent comment for replies (null for top-level comments).
- **Comment.authorId**: ID of the user who created the comment.
- **Comment.institutionId**: ID of the institution for data isolation.
- **Comment.content**: The text content of the comment.
- **Comment.createdAt**: Timestamp when the comment was created.
- **Comment.updatedAt**: Timestamp of the last modification to the comment.

### PostLike Entity
- **PostLike.id**: Unique identifier with prefix `plike_` following project conventions.
- **PostLike.postId**: ID of the post being liked.
- **PostLike.userId**: ID of the user who liked the post.
- **PostLike.institutionId**: ID of the institution for data isolation.
- **PostLike.createdAt**: Timestamp when the like was created.

### CommentLike Entity
- **CommentLike.id**: Unique identifier with prefix `clike_` following project conventions.
- **CommentLike.commentId**: ID of the comment being liked.
- **CommentLike.userId**: ID of the user who liked the comment.
- **CommentLike.institutionId**: ID of the institution for data isolation.
- **CommentLike.createdAt**: Timestamp when the like was created.

---

## Business Rules

### Post Lifecycle Management
- Posts are created in **DRAFT** status and can only be edited while in this state.
- Posts must be explicitly **PUBLISHED** to become visible to other users.
- Published posts can be **ARCHIVED** by the author, making them read-only but still accessible.
- Only the author can update, publish, archive, or delete their posts.
- Deleting a post cascades to remove all associated comments and likes.

### Institution Isolation
- All social interactions are scoped to the user's institution.
- Users can only see and interact with posts from their own institution.
- Cross-institution social interactions are not permitted.

### Comment System
- Comments can be added to any published post within the user's institution.
- Comments support **one level of nesting** (replies to comments, but no replies to replies).
- Comments can be edited by their author within **24 hours** of creation.
- Deleting a comment cascades to remove all replies and associated likes.
- Only the comment author can edit or delete their comments.

### Like System
- Each user can like a post or comment **only once** (unique constraint).
- Users can unlike posts/comments they have previously liked.
- Like counts are calculated in real-time for display purposes.
- Likes are automatically removed when the associated post or comment is deleted.

### Content Validation
- Post titles must be between 1 and 200 characters.
- Post content must be between 1 and 10,000 characters.
- Comment content must be between 1 and 1,000 characters.
- All content is trimmed of leading/trailing whitespace before validation.

### Access Control
- Users can only interact with content in their own institution.
- Draft posts are only visible to their authors.
- Published and archived posts are visible to all users in the institution.
- Users cannot edit or delete content they did not create.

---

## Use Cases

### CreatePostUseCase

**Purpose**: Creates a new post in DRAFT status.

**Inputs**:
- `title`: The title of the post (1-200 characters)
- `content`: The main content of the post (1-10,000 characters)
- `authorId`: The ID of the user creating the post
- `institutionId`: The ID of the institution where the post belongs

**Process**:
1. Validates input parameters for length and content requirements
2. Generates a unique ID with `pst_` prefix
3. Creates a new Post entity in DRAFT status
4. Sets creation and update timestamps
5. Saves the post to the repository
6. Returns the created post

**Business Rules**:
- Title and content cannot be empty after trimming
- Title must not exceed 200 characters
- Content must not exceed 10,000 characters
- Post is created in DRAFT status by default
- Author and institution IDs must be valid

### UpdatePostUseCase

**Purpose**: Updates the title and/or content of an existing post.

**Inputs**:
- `postId`: The ID of the post to update
- `title` (optional): New title for the post
- `content` (optional): New content for the post
- `userId`: The ID of the user performing the update

**Process**:
1. Validates input parameters
2. Retrieves the post by ID
3. Verifies the user is the post author
4. Checks that the post is in DRAFT status
5. Updates the specified fields using entity methods
6. Updates the modification timestamp
7. Saves the updated post
8. Returns the updated post

**Business Rules**:
- Only the post author can update the post
- Posts can only be updated while in DRAFT status
- At least one field (title or content) must be provided
- Updated fields must meet validation requirements
- Modification timestamp is automatically updated

### PublishPostUseCase

**Purpose**: Changes a post status from DRAFT to PUBLISHED, making it visible to other users.

**Inputs**:
- `postId`: The ID of the post to publish
- `userId`: The ID of the user performing the action

**Process**:
1. Validates input parameters
2. Retrieves the post by ID
3. Verifies the user is the post author
4. Checks that the post is currently in DRAFT status
5. Changes status to PUBLISHED using entity method
6. Sets the published timestamp
7. Updates the modification timestamp
8. Saves the updated post
9. Returns the published post

**Business Rules**:
- Only the post author can publish the post
- Posts can only be published from DRAFT status
- Published timestamp is set when status changes
- Published posts become visible to all institution users
- Published posts cannot be edited

### ArchivePostUseCase

**Purpose**: Changes a post status from PUBLISHED to ARCHIVED, making it read-only.

**Inputs**:
- `postId`: The ID of the post to archive
- `userId`: The ID of the user performing the action

**Process**:
1. Validates input parameters
2. Retrieves the post by ID
3. Verifies the user is the post author
4. Checks that the post is currently PUBLISHED
5. Changes status to ARCHIVED using entity method
6. Updates the modification timestamp
7. Saves the updated post
8. Returns the archived post

**Business Rules**:
- Only the post author can archive the post
- Posts can only be archived from PUBLISHED status
- Archived posts remain visible but become read-only
- Archived posts cannot be edited or published again

### GetPostUseCase

**Purpose**: Retrieves a single post with metadata including like status for the requesting user.

**Inputs**:
- `postId`: The ID of the post to retrieve
- `userId`: The ID of the user requesting the post

**Process**:
1. Validates input parameters
2. Retrieves the post by ID
3. Checks access permissions (published posts or author's own drafts)
4. Retrieves like count for the post
5. Checks if the requesting user has liked the post
6. Retrieves comment count for the post
7. Returns post with metadata

**Business Rules**:
- Users can only access posts from their institution
- Draft posts are only accessible to their authors
- Published and archived posts are accessible to all institution users
- Metadata includes like count, user's like status, and comment count

### ListPostsUseCase

**Purpose**: Retrieves a paginated list of published posts within an institution.

**Inputs**:
- `institutionId`: The ID of the institution to list posts from
- `userId`: The ID of the user requesting the list
- `limit` (optional): Maximum number of posts to return (default: 20)

**Process**:
1. Validates input parameters
2. Retrieves published posts for the institution
3. Applies pagination limit
4. For each post, retrieves metadata (likes, comments, user's like status)
5. Sorts posts by publication date (newest first)
6. Returns the list of posts with metadata

**Business Rules**:
- Only published posts are included in the list
- Posts are sorted by publication date in descending order
- Each post includes like count, comment count, and user's like status
- Pagination limit cannot exceed 100 posts per request

### ListMyPostsUseCase

**Purpose**: Retrieves all posts created by a specific user, including drafts.

**Inputs**:
- `userId`: The ID of the user whose posts to retrieve
- `institutionId`: The ID of the institution context
- `status` (optional): Filter by post status (DRAFT, PUBLISHED, ARCHIVED)
- `limit` (optional): Maximum number of posts to return

**Process**:
1. Validates input parameters
2. Retrieves all posts by the user in the institution
3. Applies status filter if specified
4. Applies pagination limit if specified
5. For each post, retrieves metadata
6. Sorts posts by creation date (newest first)
7. Returns the list of user's posts with metadata

**Business Rules**:
- Users can see all their own posts regardless of status
- Posts are sorted by creation date in descending order
- Status filter allows viewing specific post states
- Includes complete metadata for each post

### DeletePostUseCase

**Purpose**: Permanently deletes a post and all associated data.

**Inputs**:
- `postId`: The ID of the post to delete
- `userId`: The ID of the user performing the deletion

**Process**:
1. Validates input parameters
2. Retrieves the post by ID
3. Verifies the user is the post author
4. Retrieves all comments for the post
5. For each comment, deletes all associated comment likes
6. Deletes all comments (including replies)
7. Deletes all post likes
8. Deletes the post itself
9. Returns success confirmation

**Business Rules**:
- Only the post author can delete the post
- Deletion cascades to remove all comments and their likes
- Deletion cascades to remove all post likes
- Deletion is permanent and cannot be undone
- All related data is removed to maintain referential integrity

### LikePostUseCase

**Purpose**: Allows a user to like a post.

**Inputs**:
- `postId`: The ID of the post to like
- `userId`: The ID of the user liking the post
- `institutionId`: The ID of the institution context

**Process**:
1. Validates input parameters
2. Retrieves the post to verify it exists and is accessible
3. Checks if the user has already liked the post
4. If not already liked, generates a unique ID with `plike_` prefix
5. Creates a new PostLike entity
6. Saves the like to the repository
7. Returns the created like

**Business Rules**:
- Users can only like posts from their institution
- Users can only like published posts
- Each user can like a post only once
- If already liked, returns an error message
- Like timestamp is automatically recorded

### UnlikePostUseCase

**Purpose**: Allows a user to remove their like from a post.

**Inputs**:
- `postId`: The ID of the post to unlike
- `userId`: The ID of the user removing their like

**Process**:
1. Validates input parameters
2. Searches for an existing like by the user for the post
3. If like exists, deletes it from the repository
4. If like doesn't exist, returns an error message
5. Returns success confirmation

**Business Rules**:
- Users can only unlike posts they have previously liked
- Unlike operation is idempotent (no error if not previously liked)
- Like removal is immediate and permanent

### GetPostLikesUseCase

**Purpose**: Retrieves like information for a specific post.

**Inputs**:
- `postId`: The ID of the post to get like information for
- `userId`: The ID of the user requesting the information

**Process**:
1. Validates input parameters
2. Retrieves the post to verify access permissions
3. Counts total likes for the post
4. Checks if the requesting user has liked the post
5. Returns like count and user's like status

**Business Rules**:
- Users can only get like information for accessible posts
- Returns total like count and user's personal like status
- Information is retrieved in real-time

### CreateCommentUseCase

**Purpose**: Creates a new comment on a post.

**Inputs**:
- `postId`: The ID of the post to comment on
- `content`: The content of the comment (1-1,000 characters)
- `authorId`: The ID of the user creating the comment
- `institutionId`: The ID of the institution context

**Process**:
1. Validates input parameters including content length
2. Retrieves the post to verify it exists and is published
3. Generates a unique ID with `cmt_` prefix
4. Creates a new Comment entity
5. Sets creation and update timestamps
6. Saves the comment to the repository
7. Returns the created comment

**Business Rules**:
- Comments can only be added to published posts
- Comment content must be between 1 and 1,000 characters
- Comments are automatically associated with the post and institution
- Comment timestamp is automatically recorded

### ReplyToCommentUseCase

**Purpose**: Creates a reply to an existing comment (one level of nesting only).

**Inputs**:
- `parentCommentId`: The ID of the comment being replied to
- `content`: The content of the reply (1-1,000 characters)
- `authorId`: The ID of the user creating the reply
- `institutionId`: The ID of the institution context

**Process**:
1. Validates input parameters
2. Retrieves the parent comment to verify it exists
3. Checks that the parent comment is not already a reply (prevents deep nesting)
4. Generates a unique ID with `cmt_` prefix
5. Creates a new Comment entity with parent reference
6. Inherits post ID from parent comment
7. Saves the reply to the repository
8. Returns the created reply

**Business Rules**:
- Replies can only be made to top-level comments (one level of nesting)
- Reply content must meet the same validation as regular comments
- Replies inherit the post ID from their parent comment
- Replies cannot have replies (prevents deep threading)

### UpdateCommentUseCase

**Purpose**: Updates the content of an existing comment.

**Inputs**:
- `commentId`: The ID of the comment to update
- `content`: The new content for the comment
- `userId`: The ID of the user performing the update

**Process**:
1. Validates input parameters
2. Retrieves the comment by ID
3. Verifies the user is the comment author
4. Checks that the comment is within the 24-hour edit window
5. Updates the comment content using entity method
6. Updates the modification timestamp
7. Saves the updated comment
8. Returns the updated comment

**Business Rules**:
- Only the comment author can update the comment
- Comments can only be edited within 24 hours of creation
- Updated content must meet validation requirements
- Modification timestamp is automatically updated

### DeleteCommentUseCase

**Purpose**: Permanently deletes a comment and all associated data.

**Inputs**:
- `commentId`: The ID of the comment to delete
- `userId`: The ID of the user performing the deletion

**Process**:
1. Validates input parameters
2. Retrieves the comment by ID
3. Verifies the user is the comment author
4. Retrieves all replies to the comment
5. For each reply, deletes all associated comment likes
6. Deletes all replies
7. Deletes all likes for the main comment
8. Deletes the comment itself
9. Returns success confirmation

**Business Rules**:
- Only the comment author can delete the comment
- Deletion cascades to remove all replies and their likes
- Deletion cascades to remove all comment likes
- Deletion is permanent and cannot be undone

### ListPostCommentsUseCase

**Purpose**: Retrieves all comments for a post in a hierarchical structure.

**Inputs**:
- `postId`: The ID of the post to list comments for
- `userId`: The ID of the user requesting the comments
- `includeReplies` (optional): Whether to include replies (default: true)

**Process**:
1. Validates input parameters
2. Retrieves the post to verify access permissions
3. Retrieves all top-level comments for the post
4. If includeReplies is true, retrieves replies for each comment
5. For each comment and reply, retrieves like metadata
6. Organizes comments in hierarchical structure
7. Sorts comments by creation date
8. Returns the structured comment tree

**Business Rules**:
- Users can only list comments for accessible posts
- Comments are organized in a hierarchical structure (comment → replies)
- Each comment includes like count and user's like status
- Comments are sorted by creation date (oldest first)
- Replies are nested under their parent comments

### LikeCommentUseCase

**Purpose**: Allows a user to like a comment.

**Inputs**:
- `commentId`: The ID of the comment to like
- `userId`: The ID of the user liking the comment
- `institutionId`: The ID of the institution context

**Process**:
1. Validates input parameters
2. Retrieves the comment to verify it exists
3. Checks if the user has already liked the comment
4. If not already liked, generates a unique ID with `clike_` prefix
5. Creates a new CommentLike entity
6. Saves the like to the repository
7. Returns the created like

**Business Rules**:
- Users can only like comments from their institution
- Each user can like a comment only once
- If already liked, returns an error message
- Like timestamp is automatically recorded

### UnlikeCommentUseCase

**Purpose**: Allows a user to remove their like from a comment.

**Inputs**:
- `commentId`: The ID of the comment to unlike
- `userId`: The ID of the user removing their like

**Process**:
1. Validates input parameters
2. Searches for an existing like by the user for the comment
3. If like exists, deletes it from the repository
4. If like doesn't exist, returns an error message
5. Returns success confirmation

**Business Rules**:
- Users can only unlike comments they have previously liked
- Unlike operation is idempotent (no error if not previously liked)
- Like removal is immediate and permanent

### GetCommentLikesUseCase

**Purpose**: Retrieves like information for a specific comment.

**Inputs**:
- `commentId`: The ID of the comment to get like information for
- `userId`: The ID of the user requesting the information

**Process**:
1. Validates input parameters
2. Retrieves the comment to verify it exists
3. Counts total likes for the comment
4. Checks if the requesting user has liked the comment
5. Returns like count and user's like status

**Business Rules**:
- Users can only get like information for existing comments
- Returns total like count and user's personal like status
- Information is retrieved in real-time

---

## Technical Implementation

### Entity Design Patterns
- All entities follow **Domain-Driven Design** principles with rich domain models
- Entities encapsulate business logic and validation rules
- Factory methods ensure entities are created in valid states
- Value objects are used for complex data types and validation

### Repository Pattern
- Abstract repository interfaces define data access contracts
- Firestore implementations provide concrete data persistence
- Repository methods are designed for efficient querying and data retrieval
- Batch operations are used for cascade deletions to maintain consistency

### Use Case Architecture
- Each use case represents a single business operation
- Use cases depend only on repository interfaces (Dependency Inversion)
- Input/output DTOs provide clear contracts for each operation
- Comprehensive validation and error handling in each use case

### Data Consistency
- Cascade deletions ensure referential integrity
- Unique constraints prevent duplicate likes
- Timestamps are automatically managed by entities
- Institution-based data isolation is enforced at all levels

### Performance Considerations
- Efficient Firestore queries with proper indexing
- Pagination support for large data sets
- Batch operations for related data modifications
- Real-time like and comment counts without complex aggregations

### Security and Access Control
- Institution-based data isolation
- Author-based permissions for content modification
- Input validation and sanitization
- Proper error messages without information leakage
