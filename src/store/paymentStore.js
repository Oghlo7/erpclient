import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const usePaymentStore = create((set, get) => ({
  payments: [],
  currentPayment: null,
  isLoading: false,
  error: null,
  paymentsByInvoice: [],
  // Récupérer tous les paiements
  fetchAllPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('https://erp-repo-nnrs.onrender.com/payment/all');
      set({ payments: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des paiements'
      });
      return { success: false, error: get().error };
    }
  },

  fetchPaymentsByInvoice: async (invoiceId) => {
    try {
      const response = await axios.get('https://erp-repo-nnrs.onrender.com/payment/all');
      const payments = response.data.filter(payment => payment.invoice_id === invoiceId);

      set({ paymentsByInvoice: payments, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des paiements'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les paiements par ID d'administrateur
  fetchPaymentsByAdmin: async () => {
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
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/payment/admin/${adminId}`);
      set({ payments: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des paiements'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer un paiement par ID
  fetchPaymentById: async (paymentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/payment/${paymentId}`);
      set({ currentPayment: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération du paiement'
      });
      return { success: false, error: get().error };
    }
  },

  // Créer un nouveau paiement
  createPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    
    // Ajouter l'ID de l'administrateur aux données du paiement
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...paymentData,
      created_by: adminId
    };

    try {
      const response = await axios.post('https://erp-repo-nnrs.onrender.com/payment', dataToSend);
      
      // Mettre à jour la liste des paiements avec le nouveau paiement
      set(state => ({
        payments: [...state.payments, response.data],
        currentPayment: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de création du paiement'
      });
      return { success: false, error: get().error };
    }
  },

  // Mettre à jour un paiement existant
  updatePayment: async (paymentId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`https://erp-repo-nnrs.onrender.com/payment/${paymentId}`, updateData);
      
      // Mettre à jour le paiement dans la liste des paiements
      set(state => ({
        payments: state.payments.map(payment => 
          payment.id === paymentId ? { ...payment, ...response.data } : payment
        ),
        currentPayment: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de mise à jour du paiement'
      });
      return { success: false, error: get().error };
    }
  },

  // Supprimer un paiement
  deletePayment: async (paymentId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`https://erp-repo-nnrs.onrender.com/payment/${paymentId}`);
      
      // Supprimer le paiement de la liste des paiements
      set(state => ({
        payments: state.payments.filter(payment => payment.id !== paymentId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de suppression du paiement'
      });
      return { success: false, error: get().error };
    }
  },

  // Définir le paiement actuel (pour l'édition)
  setCurrentPayment: (payment) => {
    set({ currentPayment: payment });
  },

  // Effacer le paiement actuel
  clearCurrentPayment: () => {
    set({ currentPayment: null });
  },

  // Effacer l'erreur
  clearError: () => {
    set({ error: null });
  }
}));

export default usePaymentStore;