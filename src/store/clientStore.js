import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const useClientStore = create((set, get) => ({
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,

  // Fetch all clients
  fetchAllClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('https://erp-repo-nnrs.onrender.com/client/all');
      set({ clients: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch clients'
      });
      return { success: false, error: get().error };
    }
  },

  // Fetch clients by admin ID
  fetchClientsByAdmin: async () => {
    set({ isLoading: true, error: null });
    const adminId = useAdminStore.getState().adminId;
    
    if (!adminId) {
      set({ 
        isLoading: false, 
        error: 'Admin ID not available' 
      });
      return { success: false, error: 'Admin ID not available' };
    }

    try {
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/client/admin/${adminId}`);
      set({ clients: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch clients'
      });
      return { success: false, error: get().error };
    }
  },

  // Fetch a single client by ID
  fetchClientById: async (clientId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/client/${clientId}`);
      set({ currentClient: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch client'
      });
      return { success: false, error: get().error };
    }
  },

  // Create a new client
  createClient: async (clientData) => {
    set({ isLoading: true, error: null });
    
    // Add the admin ID to the client data
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...clientData,
      created_by: adminId
    };

    try {
      const response = await axios.post('https://erp-repo-nnrs.onrender.com/client', dataToSend);
      
      // Update the clients list with the new client
      set(state => ({
        clients: [...state.clients, response.data],
        currentClient: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create client'
      });
      return { success: false, error: get().error };
    }
  },

  // Update an existing client
  updateClient: async (clientId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`https://erp-repo-nnrs.onrender.com/client/${clientId}`, updateData);
      
      // Update the client in the clients list
      set(state => ({
        clients: state.clients.map(client => 
          client.id === clientId ? { ...client, ...response.data } : client
        ),
        currentClient: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update client'
      });
      return { success: false, error: get().error };
    }
  },

  // Delete a client
  deleteClient: async (clientId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`https://erp-repo-nnrs.onrender.com/client/${clientId}`);
      
      // Remove the client from the clients list
      set(state => ({
        clients: state.clients.filter(client => client.id !== clientId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete client'
      });
      return { success: false, error: get().error };
    }
  },

  // Set current client (for editing)
  setCurrentClient: (client) => {
    set({ currentClient: client });
  },

  // Clear current client
  clearCurrentClient: () => {
    set({ currentClient: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useClientStore;