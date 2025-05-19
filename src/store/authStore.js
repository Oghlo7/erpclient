import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Import statement will be added after adminStore is created
// We'll use dynamic import to avoid circular dependencies
let useAdminStore;
import('./adminStore').then(module => {
  useAdminStore = module.default;
});

// Create auth store with persistence
const useAuthStore = create(
  persist(
    (set, get) => ({
      access_token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('http://localhost:3000/auth/login', {
            email,
            password,
          });

          const { access_token, adminId } = response.data;
          
          // Set auth header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          set({
            access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Update admin store with adminId
          if (adminId) {
            useAdminStore.getState().setAdminId(adminId);
          }
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'An error occurred during login',
          });
          return { success: false, error: get().error };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });

        const { email, password } = userData;
        try {
          const response1 = await axios.post('http://localhost:3000/admin/addAdmin', userData);
          console.log(response1.data);

          const response2 = await axios.post('http://localhost:3000/auth/login', {
            email,
            password,
          });
          
          const { access_token, adminId } = response2.data;
          
          // Set auth header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          set({
            access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Update admin store with adminId
          if (adminId) {
            useAdminStore.getState().setAdminId(adminId);
          }
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'An error occurred during registration',
          });
          return { success: false, error: get().error };
        }
      },

      // Logout action
      logout: () => {
        // Remove auth header
        delete axios.defaults.headers.common['Authorization'];
        
        set({
          access_token: null,
          isAuthenticated: false,
        });
        
        // Clear admin store on logout
        useAdminStore.getState().clearAdmin();
      },

      // Check if token is valid and refresh user data
      checkAuth: async () => {
        const token = get().access_token;
        if (!token) return false;
        
        try {
          // Set auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await axios.get('http://localhost:3000/auth');
          
          set({
            isAuthenticated: true,
          });
          
          // If response contains adminId, update admin store
          if (response.data && response.data.adminId) {
            useAdminStore.getState().setAdminId(response.data.adminId);
          }
          
          return true;
        } catch (error) {
          // If token is invalid, logout
          get().logout();
          return false;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      partialize: (state) => ({
        access_token: state.access_token, 
        isAuthenticated: state.isAuthenticated 
      }), // only persist these fields
    }
  )
);

export default useAuthStore;