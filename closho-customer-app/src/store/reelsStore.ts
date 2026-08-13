import { create } from 'zustand';
import api from '../services/api';

export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  originalPrice?: number;
}

export interface Reel {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  productId?: string;
  product?: ProductSummary;
  isLiked?: boolean;
  likesCount?: number;
  isActive: boolean;
}

interface ReelsState {
  reels: Reel[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  
  fetchReels: (refresh?: boolean) => Promise<void>;
  toggleLike: (reelId: string) => Promise<void>;
}

export const useReelsStore = create<ReelsState>((set, get) => ({
  reels: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  page: 1,
  hasMore: true,

  fetchReels: async (refresh = false) => {
    const { page, hasMore, isLoading, isRefreshing } = get();
    
    if (isLoading || isRefreshing || (!hasMore && !refresh)) return;

    if (refresh) {
      set({ isRefreshing: true, error: null });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const targetPage = refresh ? 1 : page;
      const response = await api.get(`/reels?page=${targetPage}&limit=10`);
      
      const newReels = response.data?.data?.reels || [];
      const hasNextPage = newReels.length === 10; // Assuming limit is 10

      set((state) => ({
        reels: refresh ? newReels : [...state.reels, ...newReels],
        page: targetPage + 1,
        hasMore: hasNextPage,
        isLoading: false,
        isRefreshing: false,
      }));
    } catch (error: any) {
      console.warn('Error fetching reels:', error.message || error);
      set({ 
        error: error.message || 'Failed to fetch reels',
        isLoading: false,
        isRefreshing: false
      });
    }
  },

  toggleLike: async (reelId: string) => {
    const previousReels = get().reels;
    const targetReel = previousReels.find(r => r.id === reelId);
    
    if (!targetReel) return;

    const isCurrentlyLiked = targetReel.isLiked;

    // Optimistic update
    set({
      reels: previousReels.map(r => 
        r.id === reelId 
          ? { 
              ...r, 
              isLiked: !isCurrentlyLiked, 
              likesCount: (r.likesCount || 0) + (isCurrentlyLiked ? -1 : 1) 
            } 
          : r
      )
    });

    try {
      if (isCurrentlyLiked) {
        await api.delete(`/reels/${reelId}/like`);
      } else {
        await api.post(`/reels/${reelId}/like`);
      }
    } catch (error: any) {
      // Revert optimistic update
      set({ reels: previousReels });
      console.warn('Failed to toggle like:', error.message || error);
    }
  },
}));
