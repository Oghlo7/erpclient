import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Create admin store with persistence
const useAdminStore = create(
  persist(
    (set, get) => ({
      adminId: null,
      adminData: null,
      isLoading: false,
      error: null,

      // Set admin ID
      setAdminId: (adminId) => {
        set({ adminId });
        // Optionally fetch admin data when ID is set
        get().fetchAdminData();
      },

      // Fetch admin data
      fetchAdminData: async () => {
        const adminId = get().adminId;
        if (!adminId) return;

        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`http://localhost:3000/admin/${adminId}`);
          console.log(response)
          set({
            adminData: response.data,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'An error occurred while fetching admin data',
          });
          return { success: false, error: get().error };
        }
      },

      // Update admin data
      updateAdminData: async (updateData) => {
        const adminId = get().adminId;
        if (!adminId) return { success: false, error: 'No admin ID available' };

        // Get current admin data to compare with updates
        const currentData = get().adminData;
        
        // Create an object with only the changed properties
        const changedData = {};
        for (const key in updateData) {
          // Only include properties that have changed
          if (updateData[key] !== currentData[key] && updateData[key] !== undefined) {
            changedData[key] = updateData[key];
          }
        }
        
        // If no properties changed, return early
        if (Object.keys(changedData).length === 0) {
          return { success: true, message: 'No changes to update' };
        }

        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(`http://localhost:3000/admin/${adminId}`, changedData);
          
          // Update the store with the new data
          set({
            adminData: {
              ...currentData,
              ...changedData
            },
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'An error occurred while updating admin data',
          });
          return { success: false, error: get().error };
        }
      },

      // Clear admin data (used during logout)
      clearAdmin: () => {
        set({
          adminId: null,
          adminData: null,
        });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'admin-storage', // name of the item in localStorage
      partialize: (state) => ({ 
        adminId: state.adminId,
        adminData: state.adminData
      }), // only persist these fields
    }
  )
);

export default useAdminStore;