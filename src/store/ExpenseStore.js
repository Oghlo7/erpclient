import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const useExpenseStore = create((set, get) => ({
  expenses: [],
  currentExpense: null,
  isLoading: false,
  error: null,

  // Récupérer toutes les expenses
  fetchAllExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('https://erp-repo-nnrs.onrender.com/expense/all');
      set({ expenses: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des expenses'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les expenses par ID d'administrateur
  fetchExpensesByAdmin: async () => {
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
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/expense/admin/${adminId}`);
    //   let data = response.data;
    //   data.map((expense) => {
    //     expense.totale = expense.totale.toString();
    //   });
    //   console.log("data: ",data);
      set({ expenses: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des expenses'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les expenses par catégorie
  fetchExpensesByCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/expense/categorie/${category}`);
      set({ expenses: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des expenses par catégorie'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer une expense par ID
  fetchExpenseById: async (expenseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/expense/${expenseId}`);
      const totale = parseFloat(response.data.totale).toFixed(2);
      const data = { ...response.data, totale }
      console.log("data: ",data);
      set({ currentExpense: data, isLoading: false });
      return { success: true, data: data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération de l\'expense'
      });
      return { success: false, error: get().error };
    }
  },

  // Créer une nouvelle expense
  createExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    
    // Ajouter l'ID de l'administrateur aux données de l'expense
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...expenseData,
      created_by: adminId
    };

    try {
      const response = await axios.post('https://erp-repo-nnrs.onrender.com/expense', dataToSend);
      
      // Mettre à jour la liste des expenses avec la nouvelle expense
      set(state => ({
        expenses: [...state.expenses, response.data],
        currentExpense: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de création de l\'expense'
      });
      return { success: false, error: get().error };
    }
  },

  // Mettre à jour une expense existante
  updateExpense: async (expenseId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const { totale } = updateData;
      if (totale) {
        updateData.totale = parseFloat(totale).toFixed(2);
      }

      const dataSended = {
        ...updateData,
        totale: parseFloat(Number(updateData.totale).toFixed(2)) || 99
      };
      
      console.log("updateData: ",dataSended);

      const response = await axios.put(`https://erp-repo-nnrs.onrender.com/expense/${expenseId}`, dataSended);
      
      // Mettre à jour l'expense dans la liste des expenses
      set(state => ({
        expenses: state.expenses.map(expense => 
          expense.id === expenseId ? { ...expense, ...response.data } : expense
        ),
        currentExpense: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de mise à jour de l\'expense'
      });
      return { success: false, error: get().error };
    }
  },

  // Supprimer une expense
  deleteExpense: async (expenseId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`https://erp-repo-nnrs.onrender.com/expense/${expenseId}`);
      
      // Supprimer l'expense de la liste des expenses
      set(state => ({
        expenses: state.expenses.filter(expense => expense.id !== expenseId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de suppression de l\'expense'
      });
      return { success: false, error: get().error };
    }
  },

  // Définir l'expense actuelle (pour l'édition)
  setCurrentExpense: (expense) => {
    set({ currentExpense: expense });
  },

  // Effacer l'expense actuelle
  clearCurrentExpense: () => {
    set({ currentExpense: null });
  },

  // Effacer l'erreur
  clearError: () => {
    set({ error: null });
  }
}));

export default useExpenseStore;