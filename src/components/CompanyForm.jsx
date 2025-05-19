import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import useCompanyStore from '../store/companyStore';

export default function CompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { 
    currentCompany, 
    fetchCompanyById, 
    createCompany, 
    updateCompany, 
    isLoading, 
    error, 
    clearError 
  } = useCompanyStore();
  
  // Simuler une liste de personnes pour le contact
  const [persons, setPersons] = useState([
    { id: 1, prenom: 'Samir', nom: 'Id', email: 'samir@example.com' },
    { id: 2, prenom: 'Mohammed', nom: 'Ali', email: 'mohammed@example.com' },
    { id: 3, prenom: 'Fatima', nom: 'Zahra', email: 'fatima@example.com' }
  ]);
  
  const [formData, setFormData] = useState({
    nom: '',
    contact: {
      id: '',
      prenom: '',
      nom: '',
      email: ''
    },
    pays: 'Maroc',
    tele: '',
    email: '',
    website: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    nom: '',
    tele: '',
    email: '',
    website: ''
  });
  
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  
  useEffect(() => {
    // Si en mode édition, récupérer les données de l'entreprise
    if (isEditMode) {
      fetchCompanyById(id);
    }
  }, [isEditMode, id, fetchCompanyById]);
  
  useEffect(() => {
    // Remplir le formulaire avec les données de l'entreprise lorsqu'elles sont disponibles
    if (currentCompany && isEditMode) {
      setFormData({
        nom: currentCompany.nom || '',
        contact: currentCompany.contact || { id: '', prenom: '', nom: '', email: '' },
        pays: currentCompany.pays || 'Maroc',
        tele: currentCompany.tele || '',
        email: currentCompany.email || '',
        website: currentCompany.website || ''
      });
    }
  }, [currentCompany, isEditMode]);
  
  // Filtrer les contacts en fonction du terme de recherche
  const filteredContacts = persons.filter(person => {
    const searchLower = contactSearchTerm.toLowerCase();
    return (
      person.prenom.toLowerCase().includes(searchLower) ||
      person.nom.toLowerCase().includes(searchLower) ||
      person.email.toLowerCase().includes(searchLower)
    );
  });
  
  const validateEmail = (email) => {
    if (!email) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  const validatePhone = (phone) => {
    if (!phone) return true; // Le téléphone est optionnel
    const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
    return regex.test(phone);
  };
  
  const validateUrl = (url) => {
    if (!url) return true; // L'URL est optionnelle
    try {
      new URL(url.startsWith('http') ? url : `http://${url}`);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom de l\'entreprise est requis';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Veuillez entrer une adresse email valide';
    }
    
    if (formData.tele && !validatePhone(formData.tele)) {
      errors.tele = 'Veuillez entrer un numéro de téléphone valide';
    }
    
    if (formData.website && !validateUrl(formData.website)) {
      errors.website = 'Veuillez entrer une URL valide (ex: https://example.com)';
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
  
  const handleContactSearch = (e) => {
    setContactSearchTerm(e.target.value);
  };
  
  const selectContact = (person) => {
    setFormData({
      ...formData,
      contact: {
        id: person.id,
        prenom: person.prenom,
        nom: person.nom,
        email: person.email
      }
    });
    setShowContactDropdown(false);
    setContactSearchTerm('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let result;
    
    if (isEditMode) {
      result = await updateCompany(id, formData);
    } else {
      result = await createCompany(formData);
    }
    
    if (result.success) {
      navigate('/entreprise');
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/entreprise')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'}
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
                <span className="text-red-500">*</span> Nom de l'entreprise
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
                Contact
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.contact.prenom ? `${formData.contact.prenom} ${formData.contact.nom}` : ''}
                  onClick={() => setShowContactDropdown(true)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
                  readOnly
                  placeholder="Sélectionner un contact"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                
                {showContactDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Rechercher un contact..."
                        value={contactSearchTerm}
                        onChange={handleContactSearch}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <ul className="max-h-60 overflow-auto">
                      {filteredContacts.map(person => (
                        <li 
                          key={person.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectContact(person)}
                        >
                          {person.prenom} {person.nom} - {person.email}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
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
                Email
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
                Site web
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={`w-full border ${formErrors.website ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                placeholder="https://example.com"
              />
              {formErrors.website && (
                <p className="mt-1 text-sm text-red-500">{formErrors.website}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/entreprise')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
