import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const useInvoiceStore = create((set, get) => ({
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
  filters: {
    status: null,
    client: null,
    dateFrom: null,
    dateTo: null,
  },
  sortConfig: {
    key: 'dateExpiration',
    direction: 'desc',
  },

  // Fetch all invoices
  fetchAllInvoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('https://erp-repo-nnrs.onrender.com/invoice/all');
      set({ invoices: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch invoices'
      });
      return { success: false, error: get().error };
    }
  },

  // Fetch invoices by admin ID
  fetchInvoicesByAdmin: async () => {
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
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/invoice/admin/${adminId}`);
      set({ invoices: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch invoices'
      });
      return { success: false, error: get().error };
    }
  },

  // Fetch a single invoice by ID
  fetchInvoiceById: async (invoiceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`https://erp-repo-nnrs.onrender.com/invoice/${invoiceId}`);
      console.log("response.data: ", response.data)
      set({ currentInvoice: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch invoice'
      });
      return { success: false, error: get().error };
    }
  },

  // Create a new invoice
  createInvoice: async (invoiceData) => {
    set({ isLoading: true, error: null });
    
    // Add the admin ID to the invoice data
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...invoiceData,
      created_by: adminId,
      articles: invoiceData.articles || {} // S'assurer que articles est toujours un tableau
    };
  
    try {
      const response = await axios.post('https://erp-repo-nnrs.onrender.com/invoice', dataToSend);
      
      // Update the invoices list with the new invoice
      set(state => ({
        invoices: [...state.invoices, response.data],
        currentInvoice: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create invoice'
      });
      return { success: false, error: get().error };
    }
  },

  // Update an existing invoice
  updateInvoice: async (invoiceId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log("updateData: ", updateData)
      updateData = {
        ...updateData,
        paid: parseFloat(updateData.paid),
        articles: updateData.articles || {} // S'assurer que articles est toujours un tableau
      }
      
      const response = await axios.put(`https://erp-repo-nnrs.onrender.com/invoice/${invoiceId}`, updateData);
      console.log("updateedData: ", updateData)
      // Update the invoice in the invoices list
      set(state => ({
        invoices: state.invoices.map(invoice => 
          invoice.id === invoiceId ? { ...invoice, ...response.data } : invoice
        ),
        currentInvoice: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update invoice'
      });
      return { success: false, error: get().error };
    }
  },

  // Delete a invoice
  deleteInvoice: async (invoiceId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`https://erp-repo-nnrs.onrender.com/invoice/${invoiceId}`);
      
      // Remove the invoice from the invoices list
      set(state => ({
        invoices: state.invoices.filter(invoice => invoice.id !== invoiceId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete invoice'
      });
      return { success: false, error: get().error };
    }
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  // Set sort config
  setSortConfig: (sortConfig) => {
    set({ sortConfig });
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: {
        status: null,
        client: null,
        dateFrom: null,
        dateTo: null,
      },
    });
  },

  // Set current invoice (for editing)
  setCurrentInvoice: (invoice) => {
    set({ currentInvoice: invoice });
  },

  // Clear current invoice
  clearCurrentInvoice: () => {
    set({ currentInvoice: null });
  },

  // Set invoices (utility function)
  setInvoices: (invoices) => {
    set({ invoices });
  },

  // Get filtered and sorted invoices
  getFilteredInvoices: () => {
    const { invoices, filters, sortConfig } = get();
    
    // Apply filters
    let filteredInvoices = [...invoices];
    
    if (filters.status) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.status === filters.status
      );
    }
    
    if (filters.client) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.client === filters.client
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredInvoices = filteredInvoices.filter(invoice => 
        new Date(invoice.dateExpiration) >= fromDate
      );
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredInvoices = filteredInvoices.filter(invoice => 
        new Date(invoice.dateExpiration) <= toDate
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredInvoices.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredInvoices;
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useInvoiceStore;