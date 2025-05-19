import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const useExpenseCategoryStore = create((set, get) => ({
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,

  // Récupérer toutes les catégories de produits
  fetchAllCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/expenseCategory/all');
      set({ categories: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des catégories'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les catégories par ID d'administrateur
  fetchCategoriesByAdmin: async () => {
    set({ isLoading: true, error: null });
    const adminId = useAdminStore.getState().adminId;
    
    if (!adminId) {
      set({ 
        isLoading: false, 
        error: 'ID d\'administrateur non disponible' 
      });
      return { success: false, error: 'ID d\'administrateur non disponible' };
    }

    try {
      const response = await axios.get(`http://localhost:3000/expenseCategory/admin/${adminId}`);
      set({ categories: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des catégories'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer une catégorie par ID
  fetchCategoryById: async (categoryId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:3000/expenseCategory/${categoryId}`);
      set({ currentCategory: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération de la catégorie'
      });
      return { success: false, error: get().error };
    }
  },

  // Créer une nouvelle catégorie
  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    
    // Ajouter l'ID de l'administrateur aux données de la catégorie
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...categoryData,
      created_by: adminId
    };

    try {
      const response = await axios.post('http://localhost:3000/expenseCategory', dataToSend);
      
      // Mettre à jour la liste des catégories avec la nouvelle catégorie
      set(state => ({
        categories: [...state.categories, response.data],
        currentCategory: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de création de la catégorie'
      });
      return { success: false, error: get().error };
    }
  },

  // Mettre à jour une catégorie existante
  updateCategory: async (categoryId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`http://localhost:3000/expenseCategory/${categoryId}`, updateData);
      
      // Mettre à jour la catégorie dans la liste des catégories
      set(state => ({
        categories: state.categories.map(category => 
          category.numCat === categoryId ? { ...category, ...response.data } : category
        ),
        currentCategory: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de mise à jour de la catégorie'
      });
      return { success: false, error: get().error };
    }
  },

  // Supprimer une catégorie
  deleteCategory: async (categoryId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`http://localhost:3000/expenseCategory/${categoryId}`);
      
      // Supprimer la catégorie de la liste des catégories
      set(state => ({
        categories: state.categories.filter(category => category.id !== categoryId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de suppression de la catégorie'
      });
      return { success: false, error: get().error };
    }
  },

  // Définir la catégorie actuelle (pour l'édition)
  setCurrentCategory: (category) => {
    set({ currentCategory: category });
  },

  // Effacer la catégorie actuelle
  clearCurrentCategory: () => {
    set({ currentCategory: null });
  },

  // Effacer l'erreur
  clearError: () => {
    set({ error: null });
  }
}));

export default useExpenseCategoryStore;