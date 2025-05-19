import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const useProductStore = create((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  // Récupérer tous les products
  fetchAllProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/product/all');
      set({ products: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des products'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les products par ID d'administrateur
  fetchProductsByAdmin: async () => {
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
      const response = await axios.get(`http://localhost:3000/product/admin/${adminId}`);
    //   let data = response.data;
    //   data.map((product) => {
    //     product.price = product.price.toString();
    //   });
    //   console.log("data: ",data);
      set({ products: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des products'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les products par catégorie
  fetchProductsByCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:3000/product/categorie/${category}`);
      set({ products: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des products par catégorie'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer un product par ID
  fetchProductById: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:3000/product/${productId}`);
      const price = response.data.price.toString();
      const data = { ...response.data, price }
      console.log("data: ",data);
      set({ currentProduct: data, isLoading: false });
      return { success: true, data: data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération du product'
      });
      return { success: false, error: get().error };
    }
  },

  // Créer un nouveau product
  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    
    // Ajouter l'ID de l'administrateur aux données du product
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...productData,
      created_by: adminId
    };

    try {
      const response = await axios.post('http://localhost:3000/product', dataToSend);
      
      // Mettre à jour la liste des products avec le nouveau product
      set(state => ({
        products: [...state.products, response.data],
        currentProduct: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de création du product'
      });
      return { success: false, error: get().error };
    }
  },

  // Mettre à jour un product existant
  updateProduct: async (productId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`http://localhost:3000/product/${productId}`, updateData);
      
      // Mettre à jour le product dans la liste des products
      set(state => ({
        products: state.products.map(product => 
          product.id === productId ? { ...product, ...response.data } : product
        ),
        currentProduct: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de mise à jour du product'
      });
      return { success: false, error: get().error };
    }
  },

  // Supprimer un product
  deleteProduct: async (productId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`http://localhost:3000/product/${productId}`);
      
      // Supprimer le product de la liste des products
      set(state => ({
        products: state.products.filter(product => product.id !== productId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de suppression du product'
      });
      return { success: false, error: get().error };
    }
  },

  // Définir le product actuel (pour l'édition)
  setCurrentProduct: (product) => {
    set({ currentProduct: product });
  },

  // Effacer le product actuel
  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },

  // Effacer l'erreur
  clearError: () => {
    set({ error: null });
  }
}));

export default useProductStore;