import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import useAdminStore from '../store/adminStore';
import useAuthStore from '../store/authStore';

export default function Profile() {
  // Use the admin data from the store instead of local state
  const { adminData, updateAdminData } = useAdminStore();
  const { logout } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: adminData?.first_name || '',
    last_name: adminData?.last_name || '',
    email: adminData?.email || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAdminData(formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <ArrowLeft className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-lg font-medium">Profil</h2>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-2xl font-bold mr-6">
              {formData.first_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Prénom :</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Nom de famille :</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email :</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rôle :</p>
                  <p>{adminData?.role || 'Admin'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-2xl font-bold mr-6">
            {adminData?.first_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Prénom :</p>
                <p>{adminData?.first_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nom de famille :</p>
                <p>{adminData?.last_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email :</p>
                <p>{adminData?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rôle :</p>
                <p>{adminData?.role || 'Admin'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-2 text-gray-700 hover:text-red-600 flex items-center"
        >
          Se déconnecter
        </button>
      </div>

      {showPasswordModal && (
        <PasswordUpdateModal 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}
    </div>
  );
}

// Password Update Modal Component
function PasswordUpdateModal({ onClose }) {
  const { updatePassword } = useAuthStore();
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    // Update password
    updatePassword(passwordData.newPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Mettre à jour le mot de passe</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> Confirmez le mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}