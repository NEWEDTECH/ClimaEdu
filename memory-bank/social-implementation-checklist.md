# Social Module Implementation Checklist

## Overview
Implementation of a social network system within ClimaEdu platform, featuring Posts, Comments, and Likes functionality similar to Medium.com.

## Phase 1: Core Entities Implementation

### 1.1 Post Entity
- [x] Create `Post.ts` entity with all properties and methods
  - [x] Properties: id, authorId, institutionId, title, content, status, createdAt, updatedAt, publishedAt
  - [x] Methods: create(), publish(), archive(), updateContent(), touch()
  - [x] PostStatus enum: DRAFT, PUBLISHED, ARCHIVED
  - [x] Validation rules for title and content
  - [x] Business rules for publishing and archiving

### 1.2 Comment Entity
- [x] Create `Comment.ts` entity with all properties and methods
  - [x] Properties: id, postId, parentCommentId, authorId, institutionId, content, createdAt, updatedAt
  - [x] Methods: create(), updateContent(), isReply(), touch()
  - [x] Validation rules for content
  - [x] Business rules for nested comments (replies)

### 1.3 PostLike Entity
- [x] Create `PostLike.ts` entity with all properties and methods
  - [x] Properties: id, postId, userId, institutionId, createdAt
  - [x] Methods: create()
  - [x] Business rules for unique likes per user per post

### 1.4 CommentLike Entity
- [x] Create `CommentLike.ts` entity with all properties and methods
  - [x] Properties: id, commentId, userId, institutionId, createdAt
  - [x] Methods: create()
  - [x] Business rules for unique likes per user per comment

## Phase 2: Repository Interfaces

### 2.1 PostRepository Interface
- [x] Create `PostRepository.ts` interface
  - [x] generateId(): Promise<string>
  - [x] save(post: Post): Promise<Post>
  - [x] findById(id: string): Promise<Post | null>
  - [x] findByAuthor(authorId: string, institutionId: string): Promise<Post[]>
  - [x] findByInstitution(institutionId: string, status?: PostStatus): Promise<Post[]>
  - [x] findPublishedPosts(institutionId: string, limit?: number): Promise<Post[]>
  - [x] delete(id: string): Promise<void>

### 2.2 CommentRepository Interface
- [x] Create `CommentRepository.ts` interface
  - [x] generateId(): Promise<string>
  - [x] save(comment: Comment): Promise<Comment>
  - [x] findById(id: string): Promise<Comment | null>
  - [x] findByPost(postId: string): Promise<Comment[]>
  - [x] findReplies(parentCommentId: string): Promise<Comment[]>
  - [x] findByAuthor(authorId: string, institutionId: string): Promise<Comment[]>
  - [x] delete(id: string): Promise<void>

### 2.3 PostLikeRepository Interface
- [x] Create `PostLikeRepository.ts` interface
  - [x] generateId(): Promise<string>
  - [x] save(postLike: PostLike): Promise<PostLike>
  - [x] findById(id: string): Promise<PostLike | null>
  - [x] findByPost(postId: string): Promise<PostLike[]>
  - [x] findByUserAndPost(userId: string, postId: string): Promise<PostLike | null>
  - [x] countByPost(postId: string): Promise<number>
  - [x] delete(id: string): Promise<void>

### 2.4 CommentLikeRepository Interface
- [x] Create `CommentLikeRepository.ts` interface
  - [x] generateId(): Promise<string>
  - [x] save(commentLike: CommentLike): Promise<CommentLike>
  - [x] findById(id: string): Promise<CommentLike | null>
  - [x] findByComment(commentId: string): Promise<CommentLike[]>
  - [x] findByUserAndComment(userId: string, commentId: string): Promise<CommentLike | null>
  - [x] countByComment(commentId: string): Promise<number>
  - [x] delete(id: string): Promise<void>

## Phase 3: Firestore Repository Implementations

### 3.1 FirestorePostRepository
- [x] Create `FirestorePostRepository.ts` implementation
  - [x] Implement all PostRepository methods
  - [x] Use prefixed IDs (pst_)
  - [x] Proper Firestore collection structure
  - [x] Error handling and validation
  - [x] Pagination support for findPublishedPosts

### 3.2 FirestoreCommentRepository
- [x] Create `FirestoreCommentRepository.ts` implementation
  - [x] Implement all CommentRepository methods
  - [x] Use prefixed IDs (cmt_)
  - [x] Proper Firestore collection structure
  - [x] Error handling and validation
  - [x] Efficient querying for nested comments

### 3.3 FirestorePostLikeRepository
- [x] Create `FirestorePostLikeRepository.ts` implementation
  - [x] Implement all PostLikeRepository methods
  - [x] Use prefixed IDs (plike_)
  - [x] Proper Firestore collection structure
  - [x] Error handling and validation
  - [x] Efficient counting and uniqueness checks

### 3.4 FirestoreCommentLikeRepository
- [x] Create `FirestoreCommentLikeRepository.ts` implementation
  - [x] Implement all CommentLikeRepository methods
  - [x] Use prefixed IDs (clike_)
  - [x] Proper Firestore collection structure
  - [x] Error handling and validation
  - [x] Efficient counting and uniqueness checks

## Phase 4: Use Cases Implementation

### 4.1 Post Use Cases
- [x] **CreatePostUseCase**
  - [x] Input: title, content, authorId, institutionId
  - [x] Output: Created post in DRAFT status
  - [x] Validation: title and content requirements
  - [x] Business rules: user permissions

- [x] **UpdatePostUseCase**
  - [x] Input: postId, title?, content?, userId
  - [x] Output: Updated post
  - [x] Validation: user is author, post exists
  - [x] Business rules: only drafts can be updated

- [x] **PublishPostUseCase**
  - [x] Input: postId, userId
  - [x] Output: Published post
  - [x] Validation: user is author, post is draft
  - [x] Business rules: set publishedAt timestamp

- [x] **ArchivePostUseCase**
  - [x] Input: postId, userId
  - [x] Output: Archived post
  - [x] Validation: user is author, post is published
  - [x] Business rules: change status to archived

- [x] **GetPostUseCase**
  - [x] Input: postId, userId
  - [x] Output: Post with like status for user
  - [x] Validation: post exists, user has access
  - [x] Business rules: institution-based access

- [x] **ListPostsUseCase**
  - [x] Input: institutionId, userId, filters?, pagination?
  - [x] Output: List of posts with like counts
  - [x] Validation: user belongs to institution
  - [x] Business rules: only published posts for non-authors

- [x] **ListMyPostsUseCase**
  - [x] Input: userId, institutionId, status?
  - [x] Output: User's posts (all statuses)
  - [x] Validation: user authentication
  - [x] Business rules: include drafts for author

- [x] **DeletePostUseCase**
  - [x] Input: postId, userId
  - [x] Output: Success confirmation
  - [x] Validation: user is author or admin
  - [x] Business rules: cascade delete comments and likes

### 4.2 Post Like Use Cases
- [x] **LikePostUseCase**
  - [x] Input: postId, userId, institutionId
  - [x] Output: Created like
  - [x] Validation: post exists, user hasn't liked yet
  - [x] Business rules: one like per user per post

- [x] **UnlikePostUseCase**
  - [x] Input: postId, userId
  - [x] Output: Success confirmation
  - [x] Validation: like exists
  - [x] Business rules: remove existing like

- [x] **GetPostLikesUseCase**
  - [x] Input: postId, userId
  - [x] Output: Like count and user's like status
  - [x] Validation: post exists, user has access
  - [x] Business rules: institution-based access

### 4.3 Comment Use Cases
- [x] **CreateCommentUseCase**
  - [x] Input: postId, content, authorId, institutionId
  - [x] Output: Created comment
  - [x] Validation: post exists, content requirements
  - [x] Business rules: user permissions

- [x] **ReplyToCommentUseCase**
  - [x] Input: parentCommentId, content, authorId, institutionId
  - [x] Output: Created reply comment
  - [x] Validation: parent comment exists, content requirements
  - [x] Business rules: nested reply limitations

- [x] **UpdateCommentUseCase**
  - [x] Input: commentId, content, userId
  - [x] Output: Updated comment
  - [x] Validation: user is author, comment exists
  - [x] Business rules: edit time limitations (24 hours)

- [x] **DeleteCommentUseCase**
  - [x] Input: commentId, userId
  - [x] Output: Success confirmation
  - [x] Validation: user is author or admin
  - [x] Business rules: cascade delete replies and likes

- [ ] **GetCommentUseCase** (Not implemented - not essential for MVP)
  - [ ] Input: commentId, userId
  - [ ] Output: Comment with like status
  - [ ] Validation: comment exists, user has access
  - [ ] Business rules: institution-based access

- [x] **ListPostCommentsUseCase**
  - [x] Input: postId, userId, includeReplies?
  - [x] Output: Comments tree structure
  - [x] Validation: post exists, user has access
  - [x] Business rules: hierarchical comment structure

### 4.4 Comment Like Use Cases
- [x] **LikeCommentUseCase**
  - [x] Input: commentId, userId, institutionId
  - [x] Output: Created like
  - [x] Validation: comment exists, user hasn't liked yet
  - [x] Business rules: one like per user per comment

- [x] **UnlikeCommentUseCase**
  - [x] Input: commentId, userId
  - [x] Output: Success confirmation
  - [x] Validation: like exists
  - [x] Business rules: remove existing like

- [x] **GetCommentLikesUseCase**
  - [x] Input: commentId, userId
  - [x] Output: Like count and user's like status
  - [x] Validation: comment exists, user has access
  - [x] Business rules: institution-based access

## Phase 5: Dependency Injection Container

### 5.1 Symbols Definition
- [x] Create `src/_core/shared/container/modules/social/symbols.ts`
  - [x] PostRepository symbol
  - [x] CommentRepository symbol
  - [x] PostLikeRepository symbol
  - [x] CommentLikeRepository symbol
  - [x] All Use Case symbols (17 total)

### 5.2 Container Registration
- [x] Create `src/_core/shared/container/modules/social/register.ts`
  - [x] Register repository implementations
  - [x] Register all use cases with proper dependencies (FIXED: All use cases now properly registered)
  - [x] Follow singleton pattern for repositories
  - [x] Follow transient pattern for use cases

### 5.3 Main Container Integration
- [x] Update `src/_core/shared/container/symbols.ts`
  - [x] Import and re-export social symbols
- [x] Update `src/_core/shared/container/containerRegister.ts`
  - [x] Import and apply social registrations

## Phase 6: Module Entry Point
- [x] Create `src/_core/modules/social/index.ts`
  - [x] Export all entities
  - [x] Export all repository interfaces
  - [x] Export all use cases
  - [x] Export container symbols

## Phase 7: ID Convention Updates
- [x] Update `docs/id-convention.md`
  - [x] Add Post (pst_)
  - [x] Add Comment (cmt_)
  - [x] Add PostLike (plike_)
  - [x] Add CommentLike (clike_)
  - [x] Update Firestore structure documentation

## Phase 8: Frontend Integration Preparation

### 8.1 Type Definitions
- [ ] Create TypeScript interfaces for frontend consumption
- [ ] Create DTOs for API responses
- [ ] Create request/response types

### 8.2 Error Handling
- [ ] Standardize error messages
- [ ] Create error codes for different scenarios
- [ ] Implement proper error propagation

### 8.3 Performance Considerations
- [ ] Implement pagination for large datasets
- [ ] Optimize queries for comment trees
- [ ] Add caching strategies where appropriate

## Phase 9: Documentation (After Human Testing)
- [ ] Create module documentation (only after human testing)
- [ ] Document all use cases with examples (only after human testing)
- [ ] Create API reference (only after human testing)
- [ ] Update system architecture documentation (only after human testing)
- [ ] Create frontend integration guide (only after human testing)

## Implementation Notes

### Business Rules Summary
1. **Institution Isolation**: All social interactions are scoped to institutions
2. **User Permissions**: Users can only interact with content in their institution
3. **Post Lifecycle**: DRAFT → PUBLISHED → ARCHIVED
4. **Unique Likes**: One like per user per post/comment
5. **Nested Comments**: Support for one level of replies
6. **Cascade Deletes**: Deleting posts removes comments and likes
7. **Author Permissions**: Authors can edit/delete their content
8. **Admin Override**: Admins can moderate any content in their institution

### Technical Considerations
1. **Firestore Structure**: Flat collections for better querying
2. **Prefixed IDs**: Consistent with project convention
3. **Clean Architecture**: Strict separation of concerns
4. **Dependency Injection**: Proper container configuration
5. **Error Handling**: Comprehensive validation and error propagation
6. **Performance**: Efficient queries and pagination support

### Priority Order
1. Core entities and repositories (Phase 1-3)
2. Essential use cases (Phase 4: Create, Read, Like operations)
3. Container setup (Phase 5-6)
4. Advanced use cases (Phase 4: Update, Delete operations)
5. Frontend preparation (Phase 8)
6. Documentation (Phase 9) - Only after human testing and validation

### Implementation Focus
- **No automated testing**: Focus on robust implementation with proper validation
- **Human testing first**: All functionality will be tested manually before documentation
- **Documentation last**: Complete documentation only after successful human validation

This checklist ensures a complete, robust, and maintainable social module implementation that follows the project's architectural patterns and conventions.
