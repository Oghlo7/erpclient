import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const useLeadStore = create((set, get) => ({
  leads: [],
  currentLead: null,
  isLoading: false,
  error: null,

  // Récupérer tous les leads
  fetchAllLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/leads/all');
      set({ leads: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des leads'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les leads par ID d'administrateur
  fetchLeadsByAdmin: async () => {
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
      const response = await axios.get(`http://localhost:3000/leads/admin/${adminId}`);
      set({ leads: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des leads'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les leads par statut
  fetchLeadsByStatus: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:3000/leads/status/${status}`);
      set({ leads: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des leads par statut'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer un lead par ID
  fetchLeadById: async (leadId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:3000/leads/${leadId}`);
      set({ currentLead: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération du lead'
      });
      return { success: false, error: get().error };
    }
  },

  // Créer un nouveau lead
  createLead: async (leadData) => {
    set({ isLoading: true, error: null });
    
    // Ajouter l'ID de l'administrateur aux données du lead
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...leadData,
      created_by: adminId
    };

    try {
      const response = await axios.post('http://localhost:3000/leads', dataToSend);
      
      // Mettre à jour la liste des leads avec le nouveau lead
      set(state => ({
        leads: [...state.leads, response.data],
        currentLead: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de création du lead'
      });
      return { success: false, error: get().error };
    }
  },

  // Mettre à jour un lead existant
  updateLead: async (leadId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`http://localhost:3000/leads/${leadId}`, updateData);
      
      // Mettre à jour le lead dans la liste des leads
      set(state => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? { ...lead, ...response.data } : lead
        ),
        currentLead: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de mise à jour du lead'
      });
      return { success: false, error: get().error };
    }
  },

  // Supprimer un lead
  deleteLead: async (leadId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`http://localhost:3000/leads/${leadId}`);
      
      // Supprimer le lead de la liste des leads
      set(state => ({
        leads: state.leads.filter(lead => lead.id !== leadId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de suppression du lead'
      });
      return { success: false, error: get().error };
    }
  },

  // Définir le lead actuel (pour l'édition)
  setCurrentLead: (lead) => {
    set({ currentLead: lead });
  },

  // Effacer le lead actuel
  clearCurrentLead: () => {
    set({ currentLead: null });
  },

  // Effacer l'erreur
  clearError: () => {
    set({ error: null });
  }
}));

export default useLeadStore;