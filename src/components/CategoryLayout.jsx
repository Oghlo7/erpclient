import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function CategoryLayout() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center">
          <Link to="/" className="text-gray-500 mr-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">Gestion des catégories</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <Link 
              to="/category/product" 
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600"
            >
              Produits
            </Link>
            <Link 
              to="/category/depense" 
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600"
            >
              Dépenses
            </Link>
          </nav>
        </div>
      </div>

      {/* Contenu des sous-routes */}
      <Outlet />
    </div>
  );
}