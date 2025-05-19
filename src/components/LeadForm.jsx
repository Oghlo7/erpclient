import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useLeadStore from '../store/leadStore';

export default function LeadForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { 
    currentLead, 
    fetchLeadById, 
    createLead, 
    updateLead, 
    isLoading, 
    error, 
    clearError 
  } = useLeadStore();
  
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    tele: '',  // Changé de tele à tele pour correspondre à l'API
    pays: 'Maroc',
    type: 'Personne',
    statut: 'Nouveau',  // Changé de statut à statut pour correspondre à l'API
    source: '',
    projet: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    // Si en mode édition, récupérer les données du lead
    if (isEditMode) {
      fetchLeadById(id);
    }
  }, [isEditMode, id, fetchLeadById]);
  
  useEffect(() => {
    // Remplir le formulaire avec les données du lead lorsqu'elles sont disponibles
    if (currentLead && isEditMode) {
      setFormData({
        nom: currentLead.nom || currentLead.name || '',
        email: currentLead.email || '',
        tele: currentLead.tele || currentLead.tele || '',
        pays: currentLead.pays || 'Maroc',
        type: currentLead.type || 'Personne',
        statut: currentLead.statut || currentLead.statut || 'Nouveau',
        source: currentLead.source || '',
        projet: currentLead.projet || currentLead.notes || ''
      });
    }
  }, [currentLead, isEditMode]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email est invalide';
    }
    
    if (!formData.tele.trim()) {
      errors.tele = 'Le Telephone est requis';
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
      result = await updateLead(id, formData);
    } else {
      result = await createLead(formData);
    }
    
    if (result.success) {
      navigate('/lead');
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/lead')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Modifier le lead' : 'Ajouter un lead'}
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
                <span className="text-red-500">*</span> Telephone
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays
              </label>
              <select
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Maroc">Maroc</option>
                <option value="Algérie">Algérie</option>
                <option value="Tunisie">Tunisie</option>
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Canada">Canada</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Personne">Personne</option>
                <option value="Entreprise">Entreprise</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Nouveau">Nouveau</option>
                <option value="En cours">En cours</option>
                <option value="Gagné">Gagné</option>
                <option value="Perdu">Perdu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Sélectionner</option>
                <option value="Publicité">Publicité</option>
                <option value="Référence">Référence</option>
                <option value="Site web">Site web</option>
                <option value="Réseaux sociaux">Réseaux sociaux</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description du projet
              </label>
              <textarea
                name="projet"
                value={formData.projet}
                onChange={handleChange}
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/lead')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}