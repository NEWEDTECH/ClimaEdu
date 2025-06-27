import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types for the social store
export interface SocialUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SocialPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: SocialUser;
  institutionId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
}

export interface SocialComment {
  id: string;
  postId: string;
  parentCommentId?: string;
  authorId: string;
  author?: SocialUser;
  institutionId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  isLikedByUser: boolean;
  replies?: SocialComment[];
}

export interface SocialFilters {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  search?: string;
  authorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SocialState {
  // Current user
  currentUser: SocialUser | null;
  
  // Posts state
  posts: SocialPost[];
  currentPost: SocialPost | null;
  myPosts: SocialPost[];
  postsLoading: boolean;
  postsError: string | null;
  
  // Comments state
  comments: Record<string, SocialComment[]>; // postId -> comments
  commentsLoading: boolean;
  commentsError: string | null;
  
  // Like state
  likeLoading: Record<string, boolean>; // "post-{id}" or "comment-{id}" -> loading
  
  // UI state
  filters: SocialFilters;
  selectedPostId: string | null;
  
  // Cache
  lastFetchTime: Record<string, number>;
  
  // Actions
  setCurrentUser: (user: SocialUser | null) => void;
  
  // Posts actions
  setPosts: (posts: SocialPost[]) => void;
  addPost: (post: SocialPost) => void;
  updatePost: (postId: string, updates: Partial<SocialPost>) => void;
  removePost: (postId: string) => void;
  setCurrentPost: (post: SocialPost | null) => void;
  setMyPosts: (posts: SocialPost[]) => void;
  setPostsLoading: (loading: boolean) => void;
  setPostsError: (error: string | null) => void;
  
  // Comments actions
  setComments: (postId: string, comments: SocialComment[]) => void;
  addComment: (postId: string, comment: SocialComment) => void;
  updateComment: (postId: string, commentId: string, updates: Partial<SocialComment>) => void;
  removeComment: (postId: string, commentId: string) => void;
  setCommentsLoading: (loading: boolean) => void;
  setCommentsError: (error: string | null) => void;
  
  // Like actions
  togglePostLike: (postId: string) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  setLikeLoading: (key: string, loading: boolean) => void;
  
  // Filter actions
  setFilters: (filters: Partial<SocialFilters>) => void;
  clearFilters: () => void;
  
  // UI actions
  setSelectedPostId: (postId: string | null) => void;
  
  // Cache actions
  updateLastFetchTime: (key: string) => void;
  isCacheValid: (key: string, maxAge?: number) => boolean;
  
  // Reset actions
  reset: () => void;
}

const initialState = {
  currentUser: null,
  posts: [],
  currentPost: null,
  myPosts: [],
  postsLoading: false,
  postsError: null,
  comments: {},
  commentsLoading: false,
  commentsError: null,
  likeLoading: {},
  filters: {},
  selectedPostId: null,
  lastFetchTime: {},
};

export const useSocialStore = create<SocialState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // User actions
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Posts actions
      setPosts: (posts) => set({ posts }),
      
      addPost: (post) => set((state) => ({
        posts: [post, ...state.posts],
        myPosts: post.authorId === state.currentUser?.id 
          ? [post, ...state.myPosts] 
          : state.myPosts
      })),
      
      updatePost: (postId, updates) => set((state) => ({
        posts: state.posts.map(post => 
          post.id === postId ? { ...post, ...updates } : post
        ),
        myPosts: state.myPosts.map(post => 
          post.id === postId ? { ...post, ...updates } : post
        ),
        currentPost: state.currentPost?.id === postId 
          ? { ...state.currentPost, ...updates }
          : state.currentPost
      })),
      
      removePost: (postId) => set((state) => ({
        posts: state.posts.filter(post => post.id !== postId),
        myPosts: state.myPosts.filter(post => post.id !== postId),
        currentPost: state.currentPost?.id === postId ? null : state.currentPost,
        comments: Object.fromEntries(
          Object.entries(state.comments).filter(([key]) => key !== postId)
        )
      })),
      
      setCurrentPost: (post) => set({ currentPost: post }),
      setMyPosts: (posts) => set({ myPosts: posts }),
      setPostsLoading: (loading) => set({ postsLoading: loading }),
      setPostsError: (error) => set({ postsError: error }),
      
      // Comments actions
      setComments: (postId, comments) => set((state) => ({
        comments: { ...state.comments, [postId]: comments }
      })),
      
      addComment: (postId, comment) => set((state) => {
        const postComments = state.comments[postId] || [];
        return {
          comments: {
            ...state.comments,
            [postId]: [comment, ...postComments]
          },
          // Update comments count in posts
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, commentsCount: post.commentsCount + 1 }
              : post
          ),
          currentPost: state.currentPost?.id === postId
            ? { ...state.currentPost, commentsCount: state.currentPost.commentsCount + 1 }
            : state.currentPost
        };
      }),
      
      updateComment: (postId, commentId, updates) => set((state) => ({
        comments: {
          ...state.comments,
          [postId]: (state.comments[postId] || []).map(comment =>
            comment.id === commentId ? { ...comment, ...updates } : comment
          )
        }
      })),
      
      removeComment: (postId, commentId) => set((state) => {
        const postComments = state.comments[postId] || [];
        const filteredComments = postComments.filter(comment => comment.id !== commentId);
        
        return {
          comments: {
            ...state.comments,
            [postId]: filteredComments
          },
          // Update comments count in posts
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
              : post
          ),
          currentPost: state.currentPost?.id === postId
            ? { ...state.currentPost, commentsCount: Math.max(0, state.currentPost.commentsCount - 1) }
            : state.currentPost
        };
      }),
      
      setCommentsLoading: (loading) => set({ commentsLoading: loading }),
      setCommentsError: (error) => set({ commentsError: error }),
      
      // Like actions
      setLikeLoading: (key, loading) => set((state) => ({
        likeLoading: { ...state.likeLoading, [key]: loading }
      })),
      togglePostLike: (postId) => set((state) => {
        const updatePostLike = (post: SocialPost) => {
          if (post.id === postId) {
            return {
              ...post,
              isLikedByUser: !post.isLikedByUser,
              likesCount: post.isLikedByUser 
                ? Math.max(0, post.likesCount - 1)
                : post.likesCount + 1
            };
          }
          return post;
        };
        
        return {
          posts: state.posts.map(updatePostLike),
          myPosts: state.myPosts.map(updatePostLike),
          currentPost: state.currentPost ? updatePostLike(state.currentPost) : null
        };
      }),
      
      toggleCommentLike: (postId, commentId) => set((state) => ({
        comments: {
          ...state.comments,
          [postId]: (state.comments[postId] || []).map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLikedByUser: !comment.isLikedByUser,
                  likesCount: comment.isLikedByUser 
                    ? Math.max(0, comment.likesCount - 1)
                    : comment.likesCount + 1
                }
              : comment
          )
        }
      })),
      
      // Filter actions
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      clearFilters: () => set({ filters: {} }),
      
      // UI actions
      setSelectedPostId: (postId) => set({ selectedPostId: postId }),
      
      // Cache actions
      updateLastFetchTime: (key) => set((state) => ({
        lastFetchTime: { ...state.lastFetchTime, [key]: Date.now() }
      })),
      
      isCacheValid: (key, maxAge = 5 * 60 * 1000) => { // 5 minutes default
        const lastFetch = get().lastFetchTime[key];
        return lastFetch && (Date.now() - lastFetch) < maxAge;
      },
      
      // Reset actions
      reset: () => set(initialState)
    }),
    {
      name: 'social-store',
      partialize: (state: SocialState) => ({
        // Only persist user and filters
        currentUser: state.currentUser,
        filters: state.filters,
      }),
    }
  )
);

// Selectors for better performance
export const useSocialSelectors = {
  // Posts selectors
  useFilteredPosts: () => {
    const { posts, filters } = useSocialStore();
    
    return posts.filter(post => {
      if (filters.status && post.status !== filters.status) return false;
      if (filters.search && !post.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !post.content.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.authorId && post.authorId !== filters.authorId) return false;
      if (filters.dateFrom && post.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && post.createdAt > filters.dateTo) return false;
      
      return true;
    });
  },
  
  // Comments selectors
  usePostComments: (postId: string) => {
    const { comments } = useSocialStore();
    return comments[postId] || [];
  },
  
  // UI selectors
  useIsLoading: () => {
    const { postsLoading, commentsLoading } = useSocialStore();
    return postsLoading || commentsLoading;
  },
  
  useHasErrors: () => {
    const { postsError, commentsError } = useSocialStore();
    return !!(postsError || commentsError);
  }
};
