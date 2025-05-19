import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import sublogo from '../assets/sublogo.svg';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  FileOutput, 
  Users, 
  User, 
  Building2, 
  UserPlus, 
  FileSpreadsheet, 
  Package, 
  Tags, 
  Receipt, 
  BarChart4, 
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100';
  };

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
    { path: '/invoice', icon: <FileText size={20} />, label: 'Factures' },
    { path: '/payment', icon: <CreditCard size={20} />, label: 'Paiements' },
    { path: '/quote', icon: <FileOutput size={20} />, label: 'Devis pour les clients' },
    { path: '/client', icon: <Users size={20} />, label: 'Clients' },
    { path: '/person', icon: <User size={20} />, label: 'Personnes' },
    { path: '/entreprise', icon: <Building2 size={20} />, label: 'Entreprises' },
    { path: '/lead', icon: <UserPlus size={20} />, label: 'Leads' },
    // { path: '/prospects', icon: <FileSpreadsheet size={20} />, label: 'Devis pour les prospects' },
    { path: '/product', icon: <Package size={20} />, label: 'Produits' },
    { path: '/category/product', icon: <Tags size={20} />, label: 'Catégories de produits' },
    { path: '/depense', icon: <Receipt size={20} />, label: 'Dépenses' },
    { path: '/category/depense', icon: <Tags size={20} />, label: 'Catégorie de dépenses' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
      <div className="sidebar-header">
      <Link to="/" className="flex items-center p-4">
      <img src={sublogo} alt="Logo" 
        className="w-10 h-10" />
        </Link>
      </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md ${isActive(item.path)}`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* Settings dropdown */}
          <div className="relative">
            <button 
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${isActive('/settings')}`}
            >
              <div className="flex items-center">
                <span className="mr-3"><Settings size={20} /></span>
                <span>Paramètres</span>
              </div>
              <span>{settingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
            </button>
            
            {settingsOpen && (
              <div className="pl-10 mt-1 space-y-1">
                <Link
                  to="/settings/profil"
                  className={`flex items-center px-3 py-2 rounded-md ${isActive('/settings/profil')}`}
                >
                  <span className="mr-3"><User size={16} /></span>
                  <span>Profil</span>
                </Link>
              </div>
            )}
          </div>
        </nav>  
      </div>
    </div>
  );
}
