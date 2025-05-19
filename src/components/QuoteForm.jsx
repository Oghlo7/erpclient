import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import useQuoteStore from '../store/quoteStore';
import useClientStore from '../store/clientStore';

export default function QuoteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { 
    currentQuote, 
    fetchQuoteById, 
    createQuote, 
    updateQuote, 
    isLoading: quoteLoading, 
    error: quoteError, 
    clearError: clearQuoteError 
  } = useQuoteStore();
  
  const {
    clients,
    fetchClientsByAdmin,
    isLoading: clientsLoading,
    error: clientsError
  } = useClientStore();
  
  // État pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    numFacture: '',
    client: '',
    dateExpiration: formatDate(new Date(new Date().setMonth(new Date().getMonth() + 1))),
    paid: 0,
    status: 'en attente',
    type: 'Personne',
    total: 32, // Valeur initiale fixe
    articles: {}
    //     articles: [],
    //     taxe: 0,
    //     sousTotal: 0,
    //     total: 0
    // }
  });
  
  const [formErrors, setFormErrors] = useState({});

  const [cartState, setCartState] = useState({
    articles: [],
    taxe: 0,
    sousTotal: 0,
    total: 0
  });

   // State pour le nouvel article
   const [newArticle, setNewArticle] = useState({
    nom: '',
    description: '',
    quantite: 1,
    prix: 0
  });

  // Taux de taxe modifiable via l'interface
  const [tauxTaxe, setTauxTaxe] = useState(0.20); // 20% par défaut

  // Fonction pour formater la date au format YYYY-MM-DD
  function formatDate(date) {
    if (!date) return '';
    
    // Si la date est déjà une chaîne au format YYYY-MM-DD, la retourner telle quelle
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    
    // Convertir la chaîne en objet Date si nécessaire
    let dateObj = date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    }
    
    // Vérifier si la date est valide
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.error('Date invalide:', date);
      return '';
    }
    
    // Formater la date au format YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  useEffect(() => {
    // Charger les clients au montage du composant
    fetchClientsByAdmin();
    
    // Si en mode édition, récupérer les données du devis
    if (isEditMode) {
      fetchQuoteById(id);
    }
  }, [isEditMode, id, fetchQuoteById, fetchClientsByAdmin]);

  useEffect(() => {
    // Remplir le formulaire avec les données du devis lorsqu'elles sont disponibles
    if (currentQuote && isEditMode) {
      // Mettre à jour les champs 
      console.log('currentQuote', currentQuote);
      setFormData({
        numFacture: currentQuote.numFacture || '',
        client: currentQuote.client || '',
        dateExpiration: formatDate(currentQuote.dateExpiration) || formatDate(new Date(new Date().setMonth(new Date().getMonth() + 1))),
        paid: parseFloat(currentQuote.paid) || 0,
        status: currentQuote.status || 'en attente',
        type: currentQuote.type || 'Personne',
        total: currentQuote.total || 0,
        articles: currentQuote.articles || {}
      });

      // Vérifier si les articles existent et les charger dans le cartState
      if (currentQuote.articles && Array.isArray(currentQuote.articles)) {
        setCartState({
          articles: currentQuote.articles,
          taxe: tauxTaxe * currentQuote.total / (1 + tauxTaxe),
          sousTotal: currentQuote.total / (1 + tauxTaxe),
          total: currentQuote.total
        });
      } else if (currentQuote.articles && currentQuote.articles.articles) {
        setCartState({
          articles: currentQuote.articles.articles || [],
          taxe: currentQuote.articles.taxe || 0,
          sousTotal: currentQuote.articles.sousTotal || 0,
          total: currentQuote.articles.total || 0
        });
      }
    }
  }, [currentQuote, isEditMode, tauxTaxe]);
  

  // Gérer les changements dans le formulaire
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
    
    // Effacer les erreurs de l'API lorsque l'utilisateur modifie le formulaire
    if (quoteError) {
      clearQuoteError();
    }
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.numFacture.trim()) {
      errors.numFacture = 'Le numéro de facture est requis';
    }
    
    if (!formData.client) {
      errors.client = 'Le client est requis';
    }
    
    if (!formData.dateExpiration) {
      errors.dateExpiration = 'La date d\'expiration est requise';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let result;
    
    if (isEditMode) {// Créer une copie mise à jour du formData avec les articles actuels du cartState
        const updatedFormData = {
            ...formData,
            articles: cartState
        };
        
        result = await updateQuote(id, updatedFormData);
    } else {
        if(cartState.articles.length > 0) {
            const updatedFormData = {
                ...formData,
                articles: cartState
            };
            result = await createQuote(updatedFormData);
        } else {
            result = await createQuote(formData);
        }
    }
    
    if (result.success) {
      navigate('/quote');
    }
  };

  // Mise à jour des champs du nouvel article
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArticle({
      ...newArticle,
      [name]: name === 'quantite' || name === 'prix' ? parseFloat(value) || 0 : value
    });
  };

  // Mise à jour du taux de taxe
  const handleTaxRateChange = (e) => {
    const newTauxTaxe = parseFloat(e.target.value) / 100 || 0;
    setTauxTaxe(newTauxTaxe);
    
    // Recalculer les totaux avec le nouveau taux
    const { sousTotal, taxe, total } = calculerTotaux(cartState.articles, newTauxTaxe);
    setCartState({
      ...cartState,
      taxe,
      total
    });
  };

  // Calcul des totaux
  const calculerTotaux = (articles, taux = tauxTaxe) => {
    const sousTotal = articles.reduce((acc, article) => {
      return acc + (article.prix * article.quantite);
    }, 0);
    
    const taxe = sousTotal * taux;
    const total = sousTotal + taxe;
    
    return { sousTotal, taxe, total };
  };

  // Ajout d'un nouvel article
  const ajouterArticle = () => {
    if (!newArticle.nom) return; // Validation simple
    
    const articleAvecTotal = {
      ...newArticle,
      total: newArticle.prix * newArticle.quantite
    };
    
    const updatedArticles = [...cartState.articles, articleAvecTotal];
    const { sousTotal, taxe, total } = calculerTotaux(updatedArticles);
    
    setCartState({
        articles: updatedArticles,
        sousTotal,
        taxe,
        total
      });
      
      // Réinitialiser le formulaire
      setNewArticle({
        nom: '',
        description: '',
        quantite: 1,
        prix: 0
      });

      console.log('Nouvel article ajouté:', articleAvecTotal);
      console.log("cartState: ", cartState)
    };

    const handleAffichCart = () => {
        console.log("cartState: ", cartState)
    }

    // Supprimer un article
  const supprimerArticle = (index) => {
    const updatedArticles = cartState.articles.filter((_, i) => i !== index);
    const { sousTotal, taxe, total } = calculerTotaux(updatedArticles);
    
    setCartState({
      articles: updatedArticles,
      sousTotal,
      taxe,
      total
    });
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/quote')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Modifier le devis' : 'Ajouter un devis'}
        </h1>
      </div>
      
      {quoteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span>{quoteError}</span>
          <button 
            onClick={clearQuoteError}
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
                <span className="text-red-500">*</span> Numéro de facture
              </label>
              <input
                type="text"
                name="numFacture"
                value={formData.numFacture}
                onChange={handleChange}
                className={`w-full border ${formErrors.numFacture ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.numFacture && (
                <p className="mt-1 text-sm text-red-500">{formErrors.numFacture}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Client
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                className={`w-full border ${formErrors.client ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 bg-white`}
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
              {formErrors.client && (
                <p className="mt-1 text-sm text-red-500">{formErrors.client}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Date d'expiration
              </label>
              <input
                type="date"
                name="dateExpiration"
                value={formData.dateExpiration}
                onChange={handleChange}
                className={`w-full border ${formErrors.dateExpiration ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.dateExpiration && (
                <p className="mt-1 text-sm text-red-500">{formErrors.dateExpiration}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant payé
              </label>
              <input
                type="number"
                name="paid"
                value={formData.paid}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="accepté">Accepté</option>
                <option value="refusé">Refusé</option>
                <option value="en attente">En attente</option>
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="Entreprise">Entreprise</option>
                <option value="Personne">Personne</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <input
                type="number"
                value={formData.total}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Le total est fixé à 32 pour le moment</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link
              to="/quote"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={quoteLoading}
            >
              {quoteLoading ? 'Chargement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
      <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Articles</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cartState.articles.map((article, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{article.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.quantite}</td>
                <td className="px-6 py-4 whitespace-nowrap">${article.prix.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">${(article.prix * article.quantite).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => supprimerArticle(index)}
                    className="text-red-600 hover:text-red-800 flex items-center justify-center"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Ligne pour ajouter un nouvel article */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  name="nom"
                  value={newArticle.nom}
                  onChange={handleInputChange}
                  placeholder="Nom de l'article"
                  className="border rounded p-1 w-full"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  name="description"
                  value={newArticle.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="border rounded p-1 w-full"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  name="quantite"
                  value={newArticle.quantite}
                  onChange={handleInputChange}
                  min="1"
                  className="border rounded p-1 w-full"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  name="prix"
                  value={newArticle.prix}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="border rounded p-1 w-full"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${(newArticle.prix * newArticle.quantite).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={ajouterArticle}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                >
                  Ajouter
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-4 max-w-md ml-auto">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Taux de taxe (%)</label>
          <div className="flex items-center">
            <input
              type="number"
              value={Math.round(tauxTaxe * 100)} 
              onChange={handleTaxRateChange}
              min="0" 
              max="100"
              step="0.1"
              className="border rounded p-2 w-24"
            />
            <span className="ml-2">%</span>
          </div>
        </div>
        <div className="flex justify-between py-2">
          <span>Sous-total :</span>
          <span>${cartState.sousTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span>Taxe :</span>
          <span>${cartState.taxe.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold text-lg">
          <span>Total :</span>
          <span>${cartState.total.toFixed(2)}</span>
        </div>
      </div>

      <button onClick={handleAffichCart}>ahhdh</button>
      
      {/* Affichage du state pour débogage */}
      {/* <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">État actuel (JSON) :</h3>
        <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify(cartState, null, 2)}
        </pre>
      </div> */}
    </div>
    </div>
  );
}