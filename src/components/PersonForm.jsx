import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePersonStore from '../store/personStore';
import useCompanyStore from '../store/companyStore';

export default function PersonForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { 
    currentPerson, 
    fetchPersonById, 
    createPerson, 
    updatePerson, 
    isLoading, 
    error, 
    clearError 
  } = usePersonStore();
  
  const {
    companies,
    fetchCompaniesByAdmin
  } = useCompanyStore();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    companyId: '',
    tele: '',
    email: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    // Charger les entreprises au montage du composant
    fetchCompaniesByAdmin();
    
    // Si en mode édition, récupérer les données de la personne
    if (isEditMode) {
      fetchPersonById(id);
      console.log('currentPerson', id);
    }
  }, [isEditMode, id, fetchPersonById, fetchCompaniesByAdmin]);
  
  useEffect(() => {
    // Remplir le formulaire avec les données de la personne lorsqu'elles sont disponibles
    if (currentPerson && isEditMode) {
      setFormData({
        first_name: currentPerson.first_name || '',
        last_name: currentPerson.last_name || '',
        companyId: currentPerson.companyId || '',
        entreprise: currentPerson.entreprise || '',
        tele: currentPerson.tele || '',
        email: currentPerson.email || '',
        id: currentPerson.id || ''
      });
    }
  }, [currentPerson, isEditMode]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'Le prélast_name est requis';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Le last_name est requis';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email est invalide';
    }
    
    if (!formData.tele.trim()) {
      errors.tele = 'Le téléphone est requis';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ lorsque l'utilisateur tape
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Effacer l'erreur API lorsque l'utilisateur apporte des modifications
    if (error) {
      clearError();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let result;
    
    if (isEditMode) {
      console.log('updatePerson', formData);
      result = await updatePerson(id, formData);
    } else {
      result = await createPerson(formData);
    }
    
    if (result.success) {
      navigate('/person');
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/person')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Modifier la personne' : 'Ajouter une personne'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span>{error}</span>
          <button 
            onClick={clearError}
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
                <span className="text-red-500">*</span> Prénom
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full border ${formErrors.first_name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.first_name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.first_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Nom de famille
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full border ${formErrors.last_name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.last_name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.last_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entreprise
              </label>
              <select
                name="entreprise"
                value={formData.entreprise}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Sélectionner une entreprise</option>
                {companies.map(entreprise => (
                  <option key={entreprise.id} value={entreprise.id}>
                    {entreprise.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Téléphone
              </label>
              <input
                type="text"
                name="tele"
                value={formData.tele}
                onChange={handleChange}
                className={`w-full border ${formErrors.tele ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.tele && (
                <p className="mt-1 text-sm text-red-500">{formErrors.tele}</p>
              )}
            </div>
            
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/person')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : isEditMode ? 'Mettre à jour' : 'Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}