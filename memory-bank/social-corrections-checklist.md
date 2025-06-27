# Social Module Corrections Checklist

## 🚨 CRITICAL ISSUES TO FIX

### Phase 1: Remove All Mocks and Static Data
- [x] Fix `src/app/social/page.tsx` - Remove mocks, use real profile/institution hooks
- [x] Fix `src/app/social/my-posts/page.tsx` - Remove mocks, use real profile/institution hooks  
- [x] Fix `src/app/social/post/[id]/page.tsx` - Remove mocks, integrate real comments system
- [x] Implement `src/app/social/edit/[id]/page.tsx` - Complete functional edit page

### Phase 2: Complete Backend Integration
- [x] Integrate real comments system in post detail page
- [x] Connect useLikes hook to real backend use cases
- [x] Connect useComments hook to real backend use cases
- [x] Implement missing use cases in container registration

### Phase 3: Complete Missing Hooks
- [x] Complete usePost hook with GetPostUseCase integration
- [ ] Add author information resolution in usePosts
- [x] Implement remaining use cases (Archive, Delete, GetPostLikes, etc.)
- [x] Update container registration with all use cases

### Phase 4: Fix Component Integration
- [x] Update PostCard to use real data and actions
- [x] Update CommentList to use real backend data
- [x] Update CommentForm to submit to real backend
- [x] Update LikeButton to use real backend actions

### Phase 5: Final Integration Testing
- [ ] Test complete post creation flow
- [ ] Test complete post editing flow
- [ ] Test complete commenting flow
- [ ] Test complete liking flow
- [ ] Test all navigation and state management

## DETAILED CORRECTIONS NEEDED

### 1. src/app/social/page.tsx
**Issues:**
- Mock userId and institutionId
- Not using real profile hooks

**Fix:**
- Replace mocks with useProfile and useCurrentInstitution
- Add proper error handling for missing user/institution

### 2. src/app/social/my-posts/page.tsx  
**Issues:**
- Mock userId and institutionId
- Not using real profile hooks

**Fix:**
- Replace mocks with useProfile and useCurrentInstitution
- Add proper error handling for missing user/institution

### 3. src/app/social/post/[id]/page.tsx
**Issues:**
- Mock user data
- Hardcoded comments array
- Console.log handlers instead of real backend calls

**Fix:**
- Use real profile hooks
- Integrate useComments hook for real data
- Implement real comment handlers (create, edit, delete, like)
- Connect to real post data via usePost hook

### 4. src/app/social/edit/[id]/page.tsx
**Issues:**
- Completely static HTML
- No functionality whatsoever
- Hardcoded data

**Fix:**
- Implement complete edit functionality
- Load post data via usePost hook
- Connect to UpdatePostUseCase
- Add real form handling and validation
- Implement save/publish actions

### 5. src/hooks/social/useComments.ts
**Issues:**
- May not be fully integrated with backend

**Fix:**
- Ensure all comment use cases are connected
- Add proper error handling
- Implement optimistic updates

### 6. src/hooks/social/useLikes.ts
**Issues:**
- May not be fully integrated with backend

**Fix:**
- Ensure all like use cases are connected
- Add proper error handling
- Implement optimistic updates

### 7. src/hooks/social/usePosts.ts
**Issues:**
- TODO for author information
- Simplified usePost hook

**Fix:**
- Implement author information resolution
- Complete usePost with GetPostUseCase
- Add all missing use cases

### 8. Container Registration
**Issues:**
- Missing use cases in registration

**Fix:**
- Register ALL 19 use cases
- Ensure proper dependency injection
- Add error handling for missing use cases

## SUCCESS CRITERIA

✅ **No mocks or hardcoded data anywhere**
✅ **All 19 use cases connected and functional**
✅ **Complete CRUD operations for posts**
✅ **Complete commenting system with replies**
✅ **Complete liking system for posts and comments**
✅ **Real user authentication and institution context**
✅ **Proper error handling throughout**
✅ **Optimistic updates for better UX**
✅ **Full integration testing passed**

## TESTING CHECKLIST

### Post Management
- [ ] Create new post (draft)
- [ ] Create and publish post
- [ ] Edit existing post
- [ ] Publish draft post
- [ ] Archive published post
- [ ] Delete post
- [ ] View post details
- [ ] List all posts in feed
- [ ] List my posts with filters

### Commenting System
- [ ] Add comment to post
- [ ] Reply to comment (1 level)
- [ ] Edit comment (within 24h)
- [ ] Delete comment
- [ ] Like/unlike comment
- [ ] View comment likes count

### Liking System
- [ ] Like/unlike post
- [ ] View post likes count
- [ ] Like/unlike comment
- [ ] View comment likes count

### Navigation and UX
- [ ] All page transitions work
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Form validations work
- [ ] Optimistic updates work
- [ ] Cache invalidation works

This checklist will be updated as corrections are implemented.
