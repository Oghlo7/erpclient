import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useExpenseStore from '../store/ExpenseStore';
import useExpenseCategoryStore from '../store/ExpenseCategoryStore';

export default function ExpenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { 
    currentExpense, 
    fetchExpenseById, 
    createExpense, 
    updateExpense, 
    isLoading: expenseLoading, 
    error: expenseError, 
    clearError: clearExpenseError 
  } = useExpenseStore();
  
  const {
    categories,
    fetchCategoriesByAdmin,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useExpenseCategoryStore();
  
  const [formData, setFormData] = useState({
    nom: '',
    category: '',
    devis: 'USD',
    totale: 0,
    desc: '',
    ref: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    // Charger les catégories au montage du composant
    fetchCategoriesByAdmin();
    console.log("Catégories chargées:", categories);
    
    // Si en mode édition, récupérer les données de la dépense
    if (isEditMode) {
      fetchExpenseById(id);
    }
  }, [isEditMode, id, fetchExpenseById, fetchCategoriesByAdmin]);
  
  useEffect(() => {
    // Remplir le formulaire avec les données de la dépense lorsqu'elles sont disponibles
    if (currentExpense && isEditMode) {
      setFormData({
        nom: currentExpense.nom || '',
        category: currentExpense.category || '',
        devis: currentExpense.devis || 'USD',
        totale: currentExpense.totale || '',
        desc: currentExpense.desc || '',
        ref: currentExpense.ref || ''
      });
    }
  }, [currentExpense, isEditMode]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom est requis';
    }
    
    if (!formData.category.trim()) {
      errors.category = 'La catégorie est requise';
    }
    
    if (!formData.totale || formData.totale <= 0) {
      errors.totale = 'Le total doit être supérieur à 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Effacer l'erreur du champ lorsque l'utilisateur tape
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Effacer l'erreur API lorsque l'utilisateur apporte des modifications
    if (expenseError) {
      clearExpenseError();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let result;
    
    if (isEditMode) {
      result = await updateExpense(id, formData);
    } else {
      result = await createExpense(formData);
    }
    
    if (result.success) {
      navigate('/depense');
    }
  };
  
  // Filtrer les catégories actives uniquement
  const activecategories = categories.filter(category => category.active);
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/depense')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Modifier la dépense' : 'Ajouter une dépense'}
        </h1>
      </div>
      
      {expenseError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span>{expenseError}</span>
          <button 
            onClick={clearExpenseError}
            className="float-right text-red-700"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Nom
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full border ${formErrors.nom ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.nom && (
                <p className="mt-1 text-sm text-red-500">{formErrors.nom}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Catégorie de dépense
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              >
                <option value="">Sélectionner</option>
                {activecategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nom}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Devise
              </label>
              <select
                name="devis"
                value={formData.devis}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="USD">$ (US Dollar)</option>
                <option value="EUR">€ (Euro)</option>
                <option value="MAD">MAD (Dirham Marocain)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> totale
              </label>
              <div className="flex items-center">
                <span className="mr-2">
                  {formData.devis === 'USD' ? '$' : formData.devis === 'EUR' ? '€' : 'MAD'}
                </span>
                <input
                  type="number"
                  name="totale"
                  value={formData.totale}
                  onChange={handleChange}
                  className={`w-full border ${formErrors.totale ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                  step="0.01"
                  min="0"
                />
              </div>
              {formErrors.totale && (
                <p className="mt-1 text-sm text-red-500">{formErrors.totale}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence
              </label>
              <input
                type="text"
                name="ref"
                value={formData.ref}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Activé
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      active: e.target.checked
                    }));
                  }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/depense')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={expenseLoading}
            >
              {expenseLoading ? 'Chargement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}