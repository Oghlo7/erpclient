import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePaymentStore from '../store/paymentStore';
import useInvoiceStore from '../store/invoiceStore';

export default function PaymentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { 
    currentPayment, 
    fetchPaymentById, 
    createPayment, 
    updatePayment, 
    isLoading, 
    error, 
    clearError 
  } = usePaymentStore();
  
  const {
    invoices,
    fetchInvoicesByAdmin
  } = useInvoiceStore();
  
  const [formData, setFormData] = useState({
    numero: '',
    date: formatDate(new Date()),
    montant: '',
    mode: 'Virement',
    ref: '',
    desc: '',
    invoice: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Fonction pour formater la date au format YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  useEffect(() => {
    // Charger les factures au montage du composant
    fetchInvoicesByAdmin();
    
    // Si en mode édition, récupérer les données du paiement
    if (isEditMode) {
      fetchPaymentById(id);
    }
  }, [isEditMode, id, fetchPaymentById, fetchInvoicesByAdmin]);
  
  useEffect(() => {
    // Remplir le formulaire avec les données du paiement lorsqu'elles sont disponibles
    if (currentPayment && isEditMode) {
      setFormData({
        numero: currentPayment.numero || '',
        date: currentPayment.date ? currentPayment.date.substring(0, 10) : formatDate(new Date()),
        montant: currentPayment.montant || '',
        mode: currentPayment.mode || 'Virement',
        ref: currentPayment.ref || '',
        desc: currentPayment.desc || '',
        invoice: currentPayment.invoice || ''
      });
    }
  }, [currentPayment, isEditMode]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.numero) {
      errors.numero = 'Le numéro est requis';
    }
    
    if (!formData.date) {
      errors.date = 'La date est requise';
    }
    
    if (!formData.montant || formData.montant <= 0) {
      errors.montant = 'Le montant doit être supérieur à 0';
    }
    
    if (!formData.invoice) {
      errors.invoice = 'La facture est requise';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || '' : value
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let result;
    
    if (isEditMode) {
      result = await updatePayment(id, formData);
    } else {
      result = await createPayment(formData);
    }
    
    if (result.success) {
      navigate('/payment');
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/payment')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Modifier le paiement' : 'Ajouter un paiement'}
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
                <span className="text-red-500">*</span> Numéro
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                className={`w-full border ${formErrors.numero ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.numero && (
                <p className="mt-1 text-sm text-red-500">{formErrors.numero}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full border ${formErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Montant
              </label>
              <input
                type="number"
                step="0.01"
                name="montant"
                value={formData.montant}
                onChange={handleChange}
                className={`w-full border ${formErrors.montant ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              />
              {formErrors.montant && (
                <p className="mt-1 text-sm text-red-500">{formErrors.montant}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Mode de paiement
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className={`w-full border ${formErrors.mode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              >
                <option value="Virement">Virement bancaire</option>
                <option value="Carte">Carte bancaire</option>
                <option value="Espèces">Espèces</option>
                <option value="Chèque">Chèque</option>
              </select>
              {formErrors.mode && (
                <p className="mt-1 text-sm text-red-500">{formErrors.mode}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence
              </label>
              <input
                type="text"
                name="ref"
                value={formData.ref}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Facture
              </label>
              <select
                name="invoice"
                value={formData.invoice}
                onChange={handleChange}
                className={`w-full border ${formErrors.invoice ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
              >
                <option value="">Sélectionner une facture</option>
                {invoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.numFacture} - {invoice.total} {invoice.devise}
                  </option>
                ))}
              </select>
              {formErrors.invoice && (
                <p className="mt-1 text-sm text-red-500">{formErrors.invoice}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/payment')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Chargement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}