import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Signup() {
  const navigate = useNavigate();
  const { register, error: registerError, isLoading, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '', // jiji123jiji
    pays: 'Maroc',
    profil: 'twichiya182.png'
  });
  
  const [errors, setErrors] = useState({
    email: ''
  });
  
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear any store errors when user starts typing
    if (registerError) clearError();
    
    // Validate email in real-time
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setErrors(prev => ({
          ...prev,
          email: 'Veuillez entrer une adresse email valide'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: ''
        }));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Veuillez entrer une adresse email valide'
      }));
      return;
    }
    
    // Split the nom field into first_name and last_name if needed
    const userData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      profil: formData.profil
    };
    
    const result = await register(userData);
    
    if (result.success) {
      // Redirect to dashboard after successful registration
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Section de gauche */}
      <div className="w-1/2 p-12 bg-white flex flex-col">
        <div className="mb-16">
          <div className="w-16 h-16 rounded-full bg-emerald-300 flex items-center justify-center relative">
            <span className="text-white text-2xl absolute top-3 left-6">★</span>
            <div className="absolute bottom-0 right-0 bg-gray-200 w-6 h-6 transform rotate-45"></div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl text-gray-600 mb-8">Gérez votre entreprise avec :</h2>
          
          <div className="space-y-10">
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Check size={16} className="text-gray-500" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Outil tout-en-un</h3>
                <p className="text-gray-500 mt-1">Exécutez et mettez à l'échelle votre application ERP</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Check size={16} className="text-gray-500" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Ajoutez et gérez facilement vos services</h3>
                <p className="text-gray-500 mt-1">Il rassemble vos clients de facturation et vos leads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section de droite */}
      <div className="w-1/2 p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-8">S'inscrire</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-sm">
                <span className="text-red-500">*</span> Prénom
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-xl"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm">
                <span className="text-red-500">*</span> Nom
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-xl"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm">
                <span className="text-red-500">*</span> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm">
                <span className="text-red-500">*</span> Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-xl"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 text-sm">
                <span className="text-red-500">*</span> Pays
              </label>
              <select
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-xl bg-white"
                required
              >
                <option value="Maroc">Maroc</option>
                <option value="Egypt">Egypt</option>
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Canada">Canada</option>
                <option value="spain">spain</option>
                <option value="germany">germany</option>
                <option value="italy">italy</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                Vous avez déjà un compte ? <Link to="/login" className="text-blue-500">Se Connecter</Link>
              </div>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-24 py-2 rounded-xl hover:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? 'Chargement...' : 'S\'inscrire'}
              </button>
            </div>
            
            {registerError && (
              <div className="mt-2 text-sm text-red-500">
                {registerError}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}