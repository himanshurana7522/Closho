import { create } from 'zustand';
import api from '../services/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
}

interface CategoryState {
  topCategories: Category[];
  subCategories: Record<string, Category[]>;
  isLoadingCategories: boolean;
  error: string | null;
  
  fetchTopCategories: () => Promise<void>;
  fetchSubCategories: (parentId: string) => Promise<void>;
  getAllCategoriesForParent: (parentId: string | null) => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  topCategories: [],
  subCategories: {},
  isLoadingCategories: false,
  error: null,

  fetchTopCategories: async () => {
    set({ isLoadingCategories: true, error: null });
    try {
      const response = await api.get('/categories?parentId=null');
      const data = response.data.data !== undefined ? response.data.data : response.data;
      set({ topCategories: data || [], isLoadingCategories: false });
    } catch (error: any) {
      console.error('Failed to fetch top categories:', error);
      set({ error: error.message, isLoadingCategories: false });
    }
  },

  fetchSubCategories: async (parentId: string) => {
    // If we already have them cached, don't re-fetch
    if (get().subCategories[parentId]) return;

    set({ isLoadingCategories: true, error: null });
    try {
      const response = await api.get(`/categories?parentId=${parentId}`);
      const data = response.data.data !== undefined ? response.data.data : response.data;
      
      set((state) => ({
        subCategories: {
          ...state.subCategories,
          [parentId]: data || []
        },
        isLoadingCategories: false
      }));
    } catch (error: any) {
      console.error(`Failed to fetch sub-categories for ${parentId}:`, error);
      set({ error: error.message, isLoadingCategories: false });
    }
  },
  
  getAllCategoriesForParent: (parentId: string | null) => {
    if (!parentId) return get().topCategories;
    return get().subCategories[parentId] || [];
  }
}));
