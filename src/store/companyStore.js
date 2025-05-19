import { create } from 'zustand';
import axios from 'axios';
import useAdminStore from './adminStore';

const useCompanyStore = create((set, get) => ({
  companies: [],
  currentCompany: null,
  isLoading: false,
  error: null,

  // Fetch all companies
  fetchAllCompanies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('https://erp-repo-nnrs.onrender.com/entreprise/all');
      set({ companies: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch companies'
      });
      return { success: false, error: get().error };
    }
  },

  // Fetch companies by admin ID
  fetchCompaniesByAdmin: async () => {
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
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/entreprise/admin/${adminId}`);
      set({ companies: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch companies'
      });
      return { success: false, error: get().error };
    }
  },

  // Fetch a single company by ID
  fetchCompanyById: async (companyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/entreprise/${companyId}`);
      set({ currentCompany: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch company'
      });
      return { success: false, error: get().error };
    }
  },

  // Create a new company
  createCompany: async (companyData) => {
    set({ isLoading: true, error: null });
    
    // Add the admin ID to the company data
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...companyData,
      created_by: adminId
    };

    try {
      const response = await axios.post('https://erp-repo-nnrs.onrender.com/entreprise/create', dataToSend);
      
      // Update the companies list with the new company
      set(state => ({
        companies: [...state.companies, response.data],
        currentCompany: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create company'
      });
      return { success: false, error: get().error };
    }
  },

  // Update an existing company
  updateCompany: async (companyId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`https://erp-repo-nnrs.onrender.com/entreprise/${companyId}`, updateData);
      
      // Update the company in the companies list
      set(state => ({
        companies: state.companies.map(company => 
          company.id === companyId ? { ...company, ...response.data } : company
        ),
        currentCompany: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update company'
      });
      return { success: false, error: get().error };
    }
  },

  // Delete a company
  deleteCompany: async (companyId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`https://erp-repo-nnrs.onrender.com/entreprise/${companyId}`);
      
      // Remove the company from the companies list
      set(state => ({
        companies: state.companies.filter(company => company.id !== companyId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete company'
      });
      return { success: false, error: get().error };
    }
  },

  // Set current company (for editing)
  setCurrentCompany: (company) => {
    set({ currentCompany: company });
  },

  // Clear current company
  clearCurrentCompany: () => {
    set({ currentCompany: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useCompanyStore;