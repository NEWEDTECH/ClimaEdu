# Podcast Bounded Context

## Overview

The Podcast bounded context is responsible for managing podcast content within the ClimaEdu platform. This context handles podcast creation, management, and monitoring (views and likes) while maintaining institutional boundaries.

## Domain Model

### Entities

#### Podcast
The main aggregate root representing a podcast within an institution.

**Properties:**
- `id: string` (readonly) - Prefixed with `pod_`
- `institutionId: string` (readonly) - Reference to the institution
- `title: string` - Podcast title (3-200 characters)
- `description: string` - Podcast description (10-1000 characters)
- `tags: string[]` - Optional tags for categorization (max 10)
- `coverImageUrl: string` - URL to the podcast cover image
- `mediaUrl: string` - URL to the podcast media file
- `mediaType: PodcastMediaType` - Type of media (AUDIO or VIDEO)
- `createdAt: Date` (readonly) - Creation timestamp
- `updatedAt: Date` - Last update timestamp

**Methods:**
- `static create(params): Podcast` - Creates a new podcast instance
- `updateTitle(newTitle): void` - Updates the podcast title
- `updateDescription(newDescription): void` - Updates the description
- `updateTags(newTags): void` - Updates the tags array
- `updateCoverImage(newCoverImageUrl): void` - Updates cover image URL
- `updateMediaUrl(newMediaUrl): void` - Updates media URL
- `updateMediaType(newMediaType): void` - Updates media type
- `touch(): void` - Updates the updatedAt timestamp

**Business Rules:**
- Must belong to an institution
- Title is required (3-200 characters)
- Description is required (10-1000 characters)
- Tags are optional (maximum 10 tags)
- Media URL must be valid
- Media type must be AUDIO or VIDEO

#### PodcastView
Represents a view event for a podcast by a user.

**Properties:**
- `id: string` (readonly) - Prefixed with `podv_`
- `podcastId: string` (readonly) - Reference to the podcast
- `userId: string` (readonly) - Reference to the user who viewed
- `institutionId: string` (readonly) - Reference to the institution
- `viewedAt: Date` (readonly) - Timestamp of the view

**Methods:**
- `static create(params): PodcastView` - Creates a new view record
- `isRecentView(hoursThreshold): boolean` - Checks if view is recent

**Business Rules:**
- A user can view the same podcast multiple times
- Views are tracked per session to avoid spam
- Only authenticated users can generate views
- Views are immutable once created

#### PodcastLike
Represents a like action for a podcast by a user.

**Properties:**
- `id: string` (readonly) - Prefixed with `podl_`
- `podcastId: string` (readonly) - Reference to the podcast
- `userId: string` (readonly) - Reference to the user who liked
- `institutionId: string` (readonly) - Reference to the institution
- `likedAt: Date` (readonly) - Timestamp of the like

**Methods:**
- `static create(params): PodcastLike` - Creates a new like record
- `isRecentLike(hoursThreshold): boolean` - Checks if like is recent

**Business Rules:**
- One like per user per podcast (toggle behavior)
- If user already liked, remove like; if not liked, add like
- Likes are tracked for engagement analytics
- Only authenticated users can like podcasts

### Value Objects

#### PodcastMediaType
Enumeration defining the types of podcast media.

**Values:**
- `AUDIO` - Audio-only podcast
- `VIDEO` - Video podcast

### Aggregates

#### Podcast Aggregate
- **Root**: Podcast
- **Entities**: PodcastView, PodcastLike (referenced by ID)
- **Invariants**: 
  - Podcast must have valid title and description
  - Media URL must be accessible
  - All views and likes must reference existing podcast

## Use Cases

### Podcast Management

#### CreatePodcastUseCase
Creates a new podcast within an institution.

**Input:**
- institutionId: string
- title: string
- description: string
- tags: string[] (optional)
- coverImageUrl: string
- mediaUrl: string
- mediaType: PodcastMediaType

**Output:**
- podcast: Podcast

**Business Rules:**
- User must have CONTENT_MANAGER or LOCAL_ADMIN role
- All required fields must be provided
- Media URL must be accessible

#### UpdatePodcastUseCase
Updates an existing podcast's information.

**Input:**
- podcastId: string
- title?: string
- description?: string
- tags?: string[]
- coverImageUrl?: string
- mediaUrl?: string
- mediaType?: PodcastMediaType

**Output:**
- podcast: Podcast

**Business Rules:**
- User must have CONTENT_MANAGER or LOCAL_ADMIN role
- Podcast must exist and belong to user's institution
- At least one field must be provided for update

#### DeletePodcastUseCase
Removes a podcast from the system.

**Input:**
- podcastId: string

**Output:**
- success: boolean

**Business Rules:**
- User must have CONTENT_MANAGER or LOCAL_ADMIN role
- Podcast must exist and belong to user's institution
- Associated views and likes are also removed

#### ListPodcastsUseCase
Retrieves podcasts for an institution.

**Input:**
- institutionId: string
- page?: number
- limit?: number
- tags?: string[]

**Output:**
- podcasts: Podcast[]
- total: number
- hasMore: boolean

#### GetPodcastUseCase
Retrieves a specific podcast by ID.

**Input:**
- podcastId: string

**Output:**
- podcast: Podcast

### Monitoring Use Cases

#### AddViewToPodcastUseCase
Records a view event for a podcast.

**Input:**
- podcastId: string
- userId: string

**Output:**
- view: PodcastView

**Business Rules:**
- User must be authenticated
- Podcast must exist
- Views are throttled to prevent spam (one per session)

#### ToggleLikePodcastUseCase
Toggles like status for a podcast by a user.

**Input:**
- podcastId: string
- userId: string

**Output:**
- liked: boolean
- like?: PodcastLike

**Business Rules:**
- User must be authenticated
- Podcast must exist
- If already liked, remove like; if not liked, add like

#### GetPodcastAnalyticsUseCase
Retrieves analytics data for a podcast.

**Input:**
- podcastId: string
- timeRange?: 'week' | 'month' | 'year' | 'all'

**Output:**
- analytics: PodcastAnalytics

**Analytics Include:**
- Total views
- Total likes
- Unique viewers
- Views over time
- Engagement rate
- Popular time periods

## Repository Interfaces

### PodcastRepository
```typescript
interface PodcastRepository {
  generateId(): Promise<string>
  save(podcast: Podcast): Promise<Podcast>
  findById(id: string): Promise<Podcast | null>
  findByInstitutionId(institutionId: string, options?: ListOptions): Promise<Podcast[]>
  delete(id: string): Promise<void>
  countByInstitutionId(institutionId: string): Promise<number>
}
```

### PodcastViewRepository
```typescript
interface PodcastViewRepository {
  generateId(): Promise<string>
  save(view: PodcastView): Promise<PodcastView>
  countByPodcastId(podcastId: string): Promise<number>
  countUniqueViewersByPodcastId(podcastId: string): Promise<number>
  findByUserAndPodcast(userId: string, podcastId: string): Promise<PodcastView | null>
  findRecentByUserAndPodcast(userId: string, podcastId: string, hours: number): Promise<PodcastView | null>
  getViewsOverTime(podcastId: string, timeRange: string): Promise<ViewsOverTime[]>
}
```

### PodcastLikeRepository
```typescript
interface PodcastLikeRepository {
  generateId(): Promise<string>
  save(like: PodcastLike): Promise<PodcastLike>
  delete(id: string): Promise<void>
  countByPodcastId(podcastId: string): Promise<number>
  findByUserAndPodcast(userId: string, podcastId: string): Promise<PodcastLike | null>
  getLikesOverTime(podcastId: string, timeRange: string): Promise<LikesOverTime[]>
}
```

## Data Storage

### Firestore Collections

#### Main Collections
- `institutions/{institutionId}/podcasts/{podcastId}` - Podcast documents
- `institutions/{institutionId}/podcast_views/{viewId}` - View tracking
- `institutions/{institutionId}/podcast_likes/{likeId}` - Like tracking

#### Document Structure

**Podcast Document:**
```json
{
  "id": "pod_abc123",
  "institutionId": "ins_xyz789",
  "title": "Climate Change Basics",
  "description": "An introduction to climate change concepts...",
  "tags": ["climate", "education", "basics"],
  "coverImageUrl": "https://storage.googleapis.com/...",
  "mediaUrl": "https://storage.googleapis.com/...",
  "mediaType": "AUDIO",
  "createdAt": "2025-01-27T10:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z"
}
```

**PodcastView Document:**
```json
{
  "id": "podv_def456",
  "podcastId": "pod_abc123",
  "userId": "usr_ghi789",
  "institutionId": "ins_xyz789",
  "viewedAt": "2025-01-27T10:30:00Z"
}
```

**PodcastLike Document:**
```json
{
  "id": "podl_jkl012",
  "podcastId": "pod_abc123",
  "userId": "usr_ghi789",
  "institutionId": "ins_xyz789",
  "likedAt": "2025-01-27T10:35:00Z"
}
```

## Integration Points

### With Other Bounded Contexts

#### Institution Context
- Podcasts belong to institutions
- Institution settings may affect podcast visibility
- Institution users can manage podcasts based on roles

#### User Context
- Users create views and likes
- User roles determine podcast management permissions
- User authentication required for interactions

#### Content Context
- Podcasts may be referenced in courses as supplementary content
- Similar media handling patterns
- Shared content management principles

## Security Considerations

### Access Control
- Only CONTENT_MANAGER and LOCAL_ADMIN can create/update/delete podcasts
- All users can view podcasts within their institution
- Views and likes require user authentication
- Cross-institution access is prohibited

### Data Validation
- Input sanitization for all text fields
- URL validation for media and cover image URLs
- File type validation for uploaded media
- Rate limiting for view and like operations

## Performance Considerations

### Caching Strategy
- Cache popular podcasts for faster access
- Cache analytics data with appropriate TTL
- Use CDN for media file delivery

### Indexing
- Index by institutionId for listing operations
- Index by tags for filtering
- Composite indexes for complex queries
- Index by userId for user-specific operations

### Scalability
- Paginated results for large podcast lists
- Batch operations for analytics calculations
- Asynchronous processing for heavy operations
- Optimized queries to minimize Firestore reads

## Monitoring and Analytics

### Metrics to Track
- Total podcasts per institution
- View counts and trends
- Like ratios and engagement
- Popular tags and categories
- User engagement patterns
- Media consumption analytics

### Reporting
- Daily/weekly/monthly analytics reports
- Top performing podcasts
- User engagement summaries
- Institution-level statistics
- Content performance insights

## Future Enhancements

### Potential Features
- Podcast series/playlists
- Comments and discussions
- Ratings and reviews
- Transcription support
- Offline download capabilities
- Social sharing features
- Advanced analytics dashboard
- Content recommendations
- Multi-language support
- Accessibility features
