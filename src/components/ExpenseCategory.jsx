import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowLeft, MoreVertical, Search, Trash2, Edit } from 'lucide-react';
import useExpenseCategoryStore from '../store/ExpenseCategoryStore';

export default function ExpenseCategory() {
  const { 
    categories, 
    fetchCategoriesByAdmin, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    isLoading, 
    error, 
    clearError 
  } = useExpenseCategoryStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ 
    nom: '', 
    desc: '', 
    couleur: [],
    active: true  // Changé de 'actif' à 'active' pour correspondre à l'API
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  useEffect(() => {
    // Charger les catégories au montage du composant
    fetchCategoriesByAdmin();
  }, [fetchCategoriesByAdmin]);
  
  // Filtrer les catégories en fonction du terme de recherche
  const filteredCategories = categories.filter(category => 
    category.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Supprimer cette ligne qui cause l'erreur
  // const charSem = ["khawya"]
  
  const handleToggle = async (category) => {
    try {
      // Créer une copie mise à jour de la catégorie avec l'état inversé
      const updatedCategory = { 
        ...category, 
        active: !category.active 
      };
      
      // Mettre à jour l'état localement avant l'appel API pour une réponse immédiate
      const updatedCategories = categories.map(cat => 
        cat.id === category.id ? updatedCategory : cat
      );
      
      // Mettre à jour l'état local immédiatement
      useExpenseCategoryStore.setState({ categories: updatedCategories });
      
      // Appeler l'API pour mettre à jour la catégorie
      const result = await updateCategory(category.id, updatedCategory);
      
      // Si la mise à jour a échoué, revenir à l'état précédent
      if (!result.success) {
        fetchCategoriesByAdmin(); // Recharger les données depuis le serveur
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état actif:", error);
      fetchCategoriesByAdmin(); // Recharger les données en cas d'erreur
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.nom.trim() === '') return;
    
    // Ajouter un log pour déboguer
    console.log("Données à envoyer:", newCategory);
    
    const result = await createCategory(newCategory);
    
    if (result.success) {
      setNewCategory({ 
        nom: '', 
        desc: '', 
        couleur: 'geekblue',
        active: true
      });
      setShowAddForm(false);
      
      // Ajouter cette ligne pour rafraîchir la liste des catégories
      fetchCategoriesByAdmin();
    } else {
      console.error("Erreur lors de l'ajout de la catégorie:", result.error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory({
      ...category
    });
    setShowEditForm(true);
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory || editingCategory.nom.trim() === '') return;
    
    const result = await updateCategory(editingCategory.id, editingCategory);
    
    if (result.success) {
      setEditingCategory(null);
      setShowEditForm(false);
      
      // Ajouter cette ligne pour rafraîchir la liste des catégories
      fetchCategoriesByAdmin();
    }
  };
  
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (categoryToDelete) {
      const result = await deleteCategory(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      // Ajouter cette ligne pour rafraîchir la liste des catégories après suppression
      if (result.success) {
        fetchCategoriesByAdmin();
      }
    }
  };
  
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setShowEditForm(false);
  };
  
  const toggleEditForm = () => {
    setShowEditForm(!showEditForm);
    setShowAddForm(false);
  };
  
  const handleInputChange = (e, formSetter) => {
    const { name, value, type, checked } = e.target;
    formSetter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Ajout d'un log pour déboguer
    if (type === 'checkbox') {
      console.log(`Checkbox ${name} changed to: ${checked}`);
    }
  };
  
  const refreshCategories = async () => {
    try {
      // Afficher un indicateur de chargement si nécessaire
      useExpenseCategoryStore.setState({ isLoading: true });
      
      // Réinitialiser les états locaux
      setSearchTerm('');
      setShowAddForm(false);
      setShowEditForm(false);
      setEditingCategory(null);
      
      // Recharger les catégories
      await fetchCategoriesByAdmin();
      
      console.log("Catégories rechargées avec succès");
    } catch (error) {
      console.error("Erreur lors du rechargement des catégories:", error);
      // Gérer l'erreur si nécessaire
    }
  };
  

  
  if (isLoading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <>
      {showAddForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={toggleAddForm}
              className="text-gray-500 mr-2"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-medium">Catégorie de dépense</h2>
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
          
          <div className="mb-6">
            <h3 className="text-center font-bold text-blue-800 mb-4">AJOUTER UNE NOUVELLE CATÉGORIE DE DÉPENSES</h3>
            
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-red-500">*</span> Nom
              </label>
              <input
                type="text"
                name="nom"
                value={newCategory.nom}
                onChange={(e) => handleInputChange(e, setNewCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-red-500">*</span> Description
              </label>
              <textarea
                name="desc"
                value={newCategory.desc} // Correction: desc -> description
                onChange={(e) => handleInputChange(e, setNewCategory)}
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-red-500">*</span> Caractéristiques
              </label>
              <select
                name="couleur"
                value={newCategory.couleur}
                onChange={(e) => handleInputChange(e, setNewCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="geekblue">Bleu</option>
                <option value="red">Rouge</option>
                <option value="green">Vert</option>
                <option value="orange">Orange</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-red-500">*</span> Activé
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="active"
                    checked={newCategory.active}
                    onChange={(e) => handleInputChange(e, setNewCategory)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddCategory}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Soumettre
              </button>
            </div>
          </div>
        </div>
      ) : showEditForm && editingCategory ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={toggleEditForm}
              className="text-gray-500 mr-2"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-medium">Modifier la catégorie de dépense</h2>
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
          
          <div className="mb-6">
            <h3 className="text-center font-bold text-blue-800 mb-4">MODIFIER LA CATÉGORIE DE DÉPENSES</h3>
            
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-red-500">*</span> Nom
              </label>
              <input
                type="text"
                name="nom"
                value={editingCategory.nom}
                onChange={(e) => handleInputChange(e, setEditingCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-red-500">*</span> Description
              </label>
              <textarea
                name="desc"
                value={editingCategory.desc} // Correction: desc -> description
                onChange={(e) => handleInputChange(e, setEditingCategory)}
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-red-500">*</span> Caractéristiques
              </label>
              <select
                name="couleur"
                value={editingCategory.couleur}
                onChange={(e) => handleInputChange(e, setEditingCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="geekblue">Bleu</option>
                <option value="red">Rouge</option>
                <option value="green">Vert</option>
                <option value="orange">Orange</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">
                <span className="text-red-500">*</span> Activé
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="active"
                    checked={editingCategory.active}
                    onChange={(e) => handleInputChange(e, setEditingCategory)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleUpdateCategory}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 flex items-center">
            <ArrowLeft className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium">Liste des catégories de dépenses</h2>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mb-4">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="float-right text-red-700"
              >
                &times;
              </button>
            </div>
          )}
          
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={refreshCategories}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Actualiser
              </button>
              <button
                type="button"
                onClick={toggleAddForm}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ajouter une nouvelle catégorie de dépenses
              </button>
            </div>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  couleur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activé
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600 hover:underline cursor-pointer">{category.nom || "tist"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.desc || "Non spécifié"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs bg-${category.couleur || "green"}-100 text-${category.couleur || "green"}-800`}>
                        {category.couleur || "Non spécifié"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={category.active}
                          onChange={() => handleToggle(category)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? "Aucune catégorie trouvée" : "Aucune catégorie disponible"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-4">Confirmer la suppression</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.nom}" ?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}