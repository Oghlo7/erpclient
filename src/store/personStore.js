import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const usePersonStore = create((set, get) => ({
  persons: [],
  currentPerson: null,
  isLoading: false,
  error: null,

  // Récupérer toutes les personnes
  fetchAllPersons: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('https://erp-repo-nnrs.onrender.com/person/all');
      set({ persons: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des personnes'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer les personnes par ID d'administrateur
  fetchPersonsByAdmin: async () => {
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
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/person/admin/${adminId}`);
      set({ persons: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération des personnes'
      });
      return { success: false, error: get().error };
    }
  },

  // Récupérer une personne par ID
  fetchPersonById: async (personId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/person/${personId}`);
      const price = response.data.price;
      const data = { ...response.data, price }
      console.log("data: ",data);
      set({ currentPerson: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de récupération de la personne'
      });
      return { success: false, error: get().error };
    }
  },

  // Créer une nouvelle personne
  createPerson: async (personData) => {
    set({ isLoading: true, error: null });
    
    // Ajouter l'ID de l'administrateur aux données de la personne
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...personData,
      created_by: adminId
    };

    try {
      const response = await axios.post('https://erp-repo-nnrs.onrender.com/person/addPerson', dataToSend);
      
      // Mettre à jour la liste des personnes avec la nouvelle personne
      set(state => ({
        persons: [...state.persons, response.data],
        currentPerson: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de création de la personne'
      });
      return { success: false, error: get().error };
    }
  },

  // Mettre à jour une personne existante
  updatePerson: async (personId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`https://erp-repo-nnrs.onrender.com/person/${personId}`, updateData);
      
      // Mettre à jour la personne dans la liste des personnes
      set(state => ({
        persons: state.persons.map(person => 
          person.id === personId ? { ...person, ...response.data } : person
        ),
        currentPerson: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de mise à jour de la personne'
      });
      return { success: false, error: get().error };
    }
  },

  // Supprimer une personne
  deletePerson: async (personId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`https://erp-repo-nnrs.onrender.com/person/${personId}`);
      
      // Supprimer la personne de la liste des personnes
      set(state => ({
        persons: state.persons.filter(person => person.id !== personId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Échec de suppression de la personne'
      });
      return { success: false, error: get().error };
    }
  },

  // Définir la personne actuelle (pour l'édition)
  setCurrentPerson: (person) => {
    set({ currentPerson: person });
  },

  // Effacer la personne actuelle
  clearCurrentPerson: () => {
    set({ currentPerson: null });
  },

  // Effacer l'erreur
  clearError: () => {
    set({ error: null });
  }
}));

export default usePersonStore;