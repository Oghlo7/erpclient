import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-700">ERP System</h1>
        </div>
        <div>
          {isAuthenticated ? (
            <button
              onClick={handleDashboardClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center"
            >
              Dashboard <ArrowRight className="ml-2" size={16} />
            </button>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Connexion
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Bienvenue dans votre système ERP
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Gérez efficacement vos ressources d'entreprise avec notre solution complète.
          Simplifiez vos opérations, optimisez vos processus et prenez des décisions éclairées.
        </p>
        
        {isAuthenticated ? (
          <button
            onClick={handleDashboardClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium shadow-lg transition-all hover:shadow-xl"
          >
            Accéder au Dashboard
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium shadow-lg transition-all hover:shadow-xl"
          >
            Commencer maintenant
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Fonctionnalités principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-blue-700">Gestion des clients</h3>
              <p className="text-gray-600">
                Suivez et gérez efficacement vos relations clients pour améliorer votre service.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-blue-700">Facturation simplifiée</h3>
              <p className="text-gray-600">
                Créez et gérez vos factures et devis en quelques clics pour un suivi financier optimal.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-blue-700">Tableaux de bord</h3>
              <p className="text-gray-600">
                Visualisez vos données importantes en temps réel pour prendre des décisions éclairées.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à optimiser votre entreprise ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Rejoignez des milliers d'entreprises qui utilisent notre ERP pour améliorer leur efficacité.
          </p>
          
          {isAuthenticated ? (
            <button
              onClick={handleDashboardClick}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md text-lg font-medium shadow-lg transition-all hover:shadow-xl"
            >
              Accéder à votre Dashboard
            </button>
          ) : (
            <Link
              to="/signup"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md text-lg font-medium shadow-lg transition-all hover:shadow-xl"
            >
              Créer un compte
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold">ERP System</h2>
              <p className="text-gray-400">Votre solution complète de gestion d'entreprise</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">À propos</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white">Confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white">Conditions</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ERP System. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;