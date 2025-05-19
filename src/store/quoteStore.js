import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import useAdminStore from './adminStore';

const useQuoteStore = create((set, get) => ({
  quotes: [],
  currentQuote: null,
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

  // Fetch all quotes
  fetchAllQuotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/devis/all');
      set({ quotes: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch quotes'
      });
      return { success: false, error: get().error };
    }
  },

  // Fetch quotes by admin ID
  fetchQuotesByAdmin: async () => {
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
      const response = await axios.get(`http://localhost:3000/devis/admin/${adminId}`);
      set({ quotes: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch quotes'
      });
      return { success: false, error: get().error };
    }
  },

  // Fetch a single quote by ID
  fetchQuoteById: async (quoteId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:3000/devis/${quoteId}`);
      console.log("response.data: ", response.data)
      set({ currentQuote: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch quote'
      });
      return { success: false, error: get().error };
    }
  },

  // Create a new quote
  createQuote: async (quoteData) => {
    set({ isLoading: true, error: null });
    
    // Add the admin ID to the quote data
    const adminId = useAdminStore.getState().adminId;
    const dataToSend = {
      ...quoteData,
      created_by: adminId,
      articles: quoteData.articles || {} // S'assurer que articles est toujours un tableau
    };
  
    try {
      const response = await axios.post('http://localhost:3000/devis', dataToSend);
      
      // Update the quotes list with the new quote
      set(state => ({
        quotes: [...state.quotes, response.data],
        currentQuote: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create quote'
      });
      return { success: false, error: get().error };
    }
  },

  // Update an existing quote
  updateQuote: async (quoteId, updateData) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log("updateData: ", updateData)
      updateData = {
        ...updateData,
        paid: parseFloat(updateData.paid),
        articles: updateData.articles || {} // S'assurer que articles est toujours un tableau
      }
      
      const response = await axios.put(`http://localhost:3000/devis/${quoteId}`, updateData);
      console.log("updateedData: ", updateData)
      // Update the quote in the quotes list
      set(state => ({
        quotes: state.quotes.map(quote => 
          quote.id === quoteId ? { ...quote, ...response.data } : quote
        ),
        currentQuote: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update quote'
      });
      return { success: false, error: get().error };
    }
  },

  // Delete a quote
  deleteQuote: async (quoteId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`http://localhost:3000/devis/${quoteId}`);
      
      // Remove the quote from the quotes list
      set(state => ({
        quotes: state.quotes.filter(quote => quote.id !== quoteId),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete quote'
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

  // Set current quote (for editing)
  setCurrentQuote: (quote) => {
    set({ currentQuote: quote });
  },

  // Clear current quote
  clearCurrentQuote: () => {
    set({ currentQuote: null });
  },

  // Set quotes (utility function)
  setQuotes: (quotes) => {
    set({ quotes });
  },

  // Get filtered and sorted quotes
  getFilteredQuotes: () => {
    const { quotes, filters, sortConfig } = get();
    
    // Apply filters
    let filteredQuotes = [...quotes];
    
    if (filters.status) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.status === filters.status
      );
    }
    
    if (filters.client) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.client === filters.client
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredQuotes = filteredQuotes.filter(quote => 
        new Date(quote.dateExpiration) >= fromDate
      );
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredQuotes = filteredQuotes.filter(quote => 
        new Date(quote.dateExpiration) <= toDate
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredQuotes.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredQuotes;
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useQuoteStore;