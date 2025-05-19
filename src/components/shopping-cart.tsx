import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function ShoppingCart() {
  // Structure du state principal
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
  };

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
      
      {/* Affichage du state pour débogage */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">État actuel (JSON) :</h3>
        <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify(cartState, null, 2)}
        </pre>
      </div>
    </div>
  );
}