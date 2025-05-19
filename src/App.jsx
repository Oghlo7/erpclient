import React, { useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import { Check } from 'lucide-react';
import AuthGuard from './components/AuthGuard'
import Signup from './components/Signup';
import Layout from './components/Layout';
import QuoteForm from './components/QuoteForm';
import QuoteList from './components/QuoteList';
// import QuoteCreate from './components/QuoteCreate';
import PersonList from './components/PersonList';
import PersonForm from './components/PersonForm';
import CompanyList from './components/CompanyList';
import CompanyForm from './components/CompanyForm';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import CategoryLayout from './components/CategoryLayout';
import ProductCategory from './components/ProductCategory';
import ExpenseCategory from './components/ExpenseCategory';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Settings from './components/Settings';
import Profile from './components/Profile';

import PaymentList from './components/PaymentList';
import PaymentForm from './components/PaymentForm';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Routes protégées avec layout */}
      <Route path="/" element={<div className="p-6">Bienvenue dans votre ERP<Link to={"/login"} >sign in</Link></div>} />
      <Route path="/dashboard" element={
        <AuthGuard>
          <Layout><Dashboard /></Layout>
        </AuthGuard>
      } />
      <Route path="/quote" element={<AuthGuard><Layout><QuoteList /></Layout></AuthGuard>} />
      <Route path="/quote/create" element={<AuthGuard><Layout><QuoteForm /></Layout></AuthGuard>} />
      {/* <Route path="/quote/create2" element={<AuthGuard><Layout><QuoteCreate /></Layout></AuthGuard>} /> */}
      <Route path="/quote/edit/:id" element={<AuthGuard><Layout><QuoteForm /></Layout></AuthGuard>} />
      <Route path="/person" element={<AuthGuard><Layout><PersonList /></Layout></AuthGuard>} />
      <Route path="/person/create" element={<AuthGuard><Layout><PersonForm /></Layout></AuthGuard>} />
      <Route path="/person/edit/:id" element={<AuthGuard><Layout><PersonForm /></Layout></AuthGuard>} />
      <Route path="/entreprise" element={<AuthGuard><Layout><CompanyList /></Layout></AuthGuard>} />
      <Route path="/entreprise/create" element={<AuthGuard><Layout><CompanyForm /></Layout></AuthGuard>} />
      <Route path="/entreprise/edit/:id" element={<AuthGuard><Layout><CompanyForm /></Layout></AuthGuard>} />
      <Route path="/client" element={<AuthGuard><Layout><ClientList /></Layout></AuthGuard>} />
      <Route path="/client/create" element={<AuthGuard><Layout><ClientForm /></Layout></AuthGuard>} />
      <Route path="/client/edit/:id" element={<AuthGuard><Layout><ClientForm /></Layout></AuthGuard>} />
      <Route path="/lead" element={<AuthGuard><Layout><LeadList /></Layout></AuthGuard>} />
      <Route path="/lead/edit/:id" element={<AuthGuard><Layout><LeadForm /></Layout></AuthGuard>} />
      <Route path="/lead/create" element={<AuthGuard><Layout><LeadForm /></Layout></AuthGuard>} />
      <Route path="/invoice" element={<AuthGuard><Layout><InvoiceList /></Layout></AuthGuard>} />
      <Route path="/invoice/create" element={<AuthGuard><Layout><InvoiceForm /></Layout></AuthGuard>} />
      <Route path="/invoice/edit/:id" element={<AuthGuard><Layout><InvoiceForm /></Layout></AuthGuard>} />

      <Route path="/quote" element={<AuthGuard><Layout><QuoteList /></Layout></AuthGuard>} />
    {/*  <Route path="/quote/edit/:id" element={<AuthGuard><Layout><QuoteForm /></Layout></AuthGuard>} /> */}
       <Route path="/quote/create" element={<AuthGuard><Layout><QuoteForm /></Layout></AuthGuard>} />
      
      {/* Nouvelles routes pour les paiements */}
      <Route path="/payment" element={<AuthGuard><Layout><PaymentList /></Layout></AuthGuard>} />
      <Route path="/payment/create" element={<AuthGuard><Layout><PaymentForm /></Layout></AuthGuard>} />
      <Route path="/payment/edit/:id" element={<AuthGuard><Layout><PaymentForm /></Layout></AuthGuard>} />

      {/* Nouvelles routes pour les produits et dépenses */}
      <Route path="/product" element={<AuthGuard><Layout><ProductList /></Layout></AuthGuard>} />
      <Route path="/product/create" element={<AuthGuard><Layout><ProductForm /></Layout></AuthGuard>} />
      <Route path="/product/edit/:numCat" element={<AuthGuard><Layout><ProductForm /></Layout></AuthGuard>} />
      {/* <Route path="/product/categorie/:categorie" element={<AuthGuard><Layout><ProductList /></Layout></AuthGuard>} /> */}
      <Route path="/depense" element={<AuthGuard><Layout><ExpenseList /></Layout></AuthGuard>} />
      <Route path="/depense/create" element={<AuthGuard><Layout><ExpenseForm /></Layout></AuthGuard>} />
      <Route path="/depense/edit/:id" element={<AuthGuard><Layout><ExpenseForm /></Layout></AuthGuard>} />
      {/* <Route path="/depense/categorie/:categorie" element={<AuthGuard><Layout><ProductList /></Layout></AuthGuard>} /> */}
      
      {/* Routes pour les catégories */}
      <Route path="/category" element={<AuthGuard><Layout><CategoryLayout /></Layout></AuthGuard>}>
        <Route index element={<AuthGuard><ProductCategory /></AuthGuard>} />
        <Route path="product" element={<AuthGuard><ProductCategory /></AuthGuard>} />
        <Route path="depense" element={<AuthGuard><ExpenseCategory /></AuthGuard>} />
      </Route>
      
      {/* Nouvelle route pour les paramètres */}
      <Route path="/settings" element={<AuthGuard><Layout><Settings /></Layout></AuthGuard>}>
        <Route index element={<Navigate to="/settings/profil" replace />} />
        <Route path="profil" element={<Profile />} />
      </Route>
      
      {/* Redirection par défaut */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default App;