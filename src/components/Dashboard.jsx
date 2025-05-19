import React, { useEffect, useState } from 'react';
import { ArrowUp, FileText, Users, DollarSign, AlertCircle } from 'lucide-react';
import useInvoiceStore from '../store/invoiceStore';
import useClientStore from '../store/clientStore';
import usePaymentStore from '../store/paymentStore';

const Dashboard = () => {
  const { invoices, fetchInvoicesByAdmin, isLoading: invoicesLoading } = useInvoiceStore();
  const { clients, fetchClientsByAdmin, isLoading: clientsLoading } = useClientStore();
  const { 
    payments, 
    fetchPaymentsByAdmin, 
    isLoading: paymentsLoading 
  } = usePaymentStore();
  
  const [stats, setStats] = useState({
    factures: { total: 0, ceMois: 0 },
    devisClients: { total: 0, ceMois: 0 },
    devisProspects: { total: 0, ceMois: 0 },
    impaye: { total: 0, nonPaye: 0 }
  });
  
  const [statuts, setStatuts] = useState({
    factures: {
      brouillon: 0,
      enAttente: 0,
      impaye: 0,
      enRetard: 0,
      partiellement: 0,
      paye: 0
    },
    devisClients: {
      brouillon: 0,
      enAttente: 0,
      envoye: 0,
      refuse: 0,
      accepte: 0,
      expire: 0
    },
    devisProspects: {
      brouillon: 0,
      enAttente: 0,
      envoye: 0,
      refuse: 0,
      accepte: 0,
      expire: 0
    }
  });
  
  const [clientStats, setClientStats] = useState({
    nouveauCeMois: 0,
    actifs: 0,
    pourcentageActifs: 0
  });
  
  const [facturesRecentes, setFacturesRecentes] = useState([]);
  const [devisRecents, setDevisRecents] = useState([]);
  
  useEffect(() => {
    // Charger les données
    fetchInvoicesByAdmin();
    fetchClientsByAdmin();
    fetchPaymentsByAdmin();
  }, [fetchInvoicesByAdmin, fetchClientsByAdmin, fetchPaymentsByAdmin]);
  
  useEffect(() => {
    if (invoicesLoading || clientsLoading || paymentsLoading) return;
    
    // Calculer les statistiques
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filtrer les factures et devis du mois courant
    const facturesCeMois = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear && inv.type === 'Standard';
    });
    
    const devisClientsCeMois = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear && inv.type === 'Devis' && inv.client_type === 'client';
    });
    
    const devisProspectsCeMois = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear && inv.type === 'Devis' && inv.client_type === 'prospect';
    });
    
    // Calculer les montants
    const montantFacturesCeMois = facturesCeMois.reduce((sum, inv) => sum + inv.total, 0);
    const montantDevisClientsCeMois = devisClientsCeMois.reduce((sum, inv) => sum + inv.total, 0);
    const montantDevisProspectsCeMois = devisProspectsCeMois.reduce((sum, inv) => sum + inv.total, 0);
    
    // Calculer les impayés
    const facturesImpayees = invoices.filter(inv => inv.type === 'Standard' && (inv.status === 'Impayé' || inv.status === 'En Retard'));
    const montantImpayes = facturesImpayees.reduce((sum, inv) => sum + (inv.total - inv.paid), 0);
    
    // Mettre à jour les statistiques
    setStats({
      factures: { 
        total: invoices.filter(inv => inv.type === 'Standard').length, 
        ceMois: montantFacturesCeMois 
      },
      devisClients: { 
        total: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'client').length, 
        ceMois: montantDevisClientsCeMois 
      },
      devisProspects: { 
        total: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'prospect').length, 
        ceMois: montantDevisProspectsCeMois 
      },
      impaye: { 
        total: facturesImpayees.length, 
        nonPaye: montantImpayes 
      }
    });
    
    // Calculer les statuts
    const facturesParStatut = {
      brouillon: invoices.filter(inv => inv.type === 'Standard' && inv.status === 'Brouillon').length,
      enAttente: invoices.filter(inv => inv.type === 'Standard' && inv.status === 'En attente').length,
      impaye: invoices.filter(inv => {
        // Une facture est impayée si elle n'a pas de paiement associé
        // ou si le montant total des paiements est inférieur au montant total de la facture
        if (inv.type !== 'Standard') return false;
        
        const invoicePayments = payments.filter(payment => payment.invoice_id === inv.id);
        const totalPaid = invoicePayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        
        return totalPaid < (parseFloat(inv.total) || 0) && inv.status !== 'Payé';
      }).length,
      enRetard: invoices.filter(inv => {
        if (!inv.dateExpiration) return false;
        const today = new Date();
        let expirationDate;
        
        // Convertir la date d'expiration en objet Date
        if (typeof inv.dateExpiration === 'string') {
          // Si le format est JJ/MM/AAAA
          if (inv.dateExpiration.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = inv.dateExpiration.split('/');
            expirationDate = new Date(year, month - 1, day);
          } 
          // Si le format est AAAA-MM-JJ
          else if (inv.dateExpiration.match(/^\d{4}-\d{2}-\d{2}$/)) {
            expirationDate = new Date(inv.dateExpiration);
          } 
          // Autres formats de date
          else {
            expirationDate = new Date(inv.dateExpiration);
          }
        } else {
          expirationDate = new Date(inv.dateExpiration);
        }
        
        // Vérifier si la date est valide
        if (isNaN(expirationDate.getTime())) return false;
        
        // Comparer les dates (sans tenir compte de l'heure)
        today.setHours(0, 0, 0, 0);
        expirationDate.setHours(0, 0, 0, 0);
        
        return expirationDate < today && inv.type === 'Standard' && inv.status !== 'Payé';
      }).length,
      partiellement: invoices.filter(inv => {
        if (inv.type !== 'Standard') return false;
        
        const invoicePayments = payments.filter(payment => payment.invoice_id === inv.id);
        const totalPaid = invoicePayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        
        return totalPaid > 0 && totalPaid < (parseFloat(inv.total) || 0);
      }).length,
      paye: invoices.filter(inv => inv.type === 'Standard' && inv.status === 'Payé').length
    };
    
    const devisClientsParStatut = {
      brouillon: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'client' && inv.status === 'Brouillon').length,
      enAttente: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'client' && inv.status === 'En attente').length,
      envoye: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'client' && inv.status === 'Envoyé').length,
      refuse: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'client' && inv.status === 'Refusé').length,
      accepte: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'client' && inv.status === 'Accepté').length,
      expire: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'client' && inv.status === 'Expiré').length
    };
    
    const devisProspectsParStatut = {
      brouillon: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'prospect' && inv.status === 'Brouillon').length,
      enAttente: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'prospect' && inv.status === 'En attente').length,
      envoye: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'prospect' && inv.status === 'Envoyé').length,
      refuse: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'prospect' && inv.status === 'Refusé').length,
      accepte: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'prospect' && inv.status === 'Accepté').length,
      expire: invoices.filter(inv => inv.type === 'Devis' && inv.client_type === 'prospect' && inv.status === 'Expiré').length
    };
    
    setStatuts({
      factures: facturesParStatut,
      devisClients: devisClientsParStatut,
      devisProspects: devisProspectsParStatut
    });
    
    // Calculer les statistiques clients
    const clientsCeMois = clients.filter(client => {
      const createdAt = new Date(client.created_at);
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
    });
    
    const clientsActifs = clients.filter(client => {
      // Un client est considéré actif s'il a au moins une facture payée
      return invoices.some(inv => inv.client === client.id && inv.status === 'Payé');
    });
    
    setClientStats({
      nouveauCeMois: clientsCeMois.length,
      actifs: clientsActifs.length,
      pourcentageActifs: clients.length > 0 ? (clientsActifs.length / clients.length) * 100 : 0
    });
    
    // Récupérer les factures et devis récents
    const facturesRecentes = invoices
      .filter(inv => inv.type === 'Standard')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    const devisRecents = invoices
      .filter(inv => inv.type === 'Devis')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    setFacturesRecentes(facturesRecentes);
    setDevisRecents(devisRecents);
    
  }, [invoices, clients, payments, invoicesLoading, clientsLoading, paymentsLoading]);
  
  // Fonction pour formater les montants
  const formatMontant = (montant, devise = '$') => {
    return `${devise} ${montant.toFixed(2)}`;
  };
  
  // Fonction pour obtenir le nom du client
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : '-';
  };
  
  // Fonction pour calculer le pourcentage
  const calculerPourcentage = (valeur, total) => {
    return total > 0 ? (valeur / total) * 100 : 0;
  };
  
  if (invoicesLoading || clientsLoading || paymentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

    const chiL3ba = () => {
        return (
            <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Factures</h2>
                <FileText className="text-blue-500" size={24} />
            </div>
            <div className="mb-2">
                <span className="text-gray-600 text-sm">Ce mois-ci</span>
                <div className="text-blue-600 font-semibold">
                {formatMontant(stats.factures.ceMois)}
                </div>
            </div>
            </div>
        )
    }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Factures */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Factures</h2>
            <FileText className="text-blue-500" size={24} />
          </div>
          <div className="mb-2">
            <span className="text-gray-600 text-sm">Ce mois-ci</span>
            <div className="text-blue-600 font-semibold">
              {formatMontant(stats.factures.ceMois)}
            </div>
          </div>
        </div>
        
        {/* Devis Pour Les Clients */}
        <chiL3ba />
        
        
        {/* Impayé */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Impayé</h2>
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <div className="mb-2">
            <span className="text-gray-600 text-sm">Non payé</span>
            <div className="text-red-600 font-semibold">
              {formatMontant(stats.impaye.nonPaye)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Graphiques et statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Statistiques des factures */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-lg font-medium mb-4">Factures</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Brouillon</span>
                <span>{calculerPourcentage(statuts.factures.brouillon, stats.factures.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.factures.brouillon, stats.factures.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>En attente</span>
                <span>{calculerPourcentage(statuts.factures.enAttente, stats.factures.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.factures.enAttente, stats.factures.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Impayé</span>
                <span>{calculerPourcentage(statuts.factures.impaye, stats.factures.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.factures.impaye, stats.factures.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>En Retard</span>
                <span>{calculerPourcentage(statuts.factures.enRetard, stats.factures.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.factures.enRetard, stats.factures.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Envoyé</span>
                <span>{calculerPourcentage(statuts.factures.partiellement, stats.factures.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.factures.partiellement, stats.factures.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Payé</span>
                <span>{calculerPourcentage(statuts.factures.paye, stats.factures.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.factures.paye, stats.factures.total)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistiques des devis clients */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-lg font-medium mb-4">Devis pour les clients</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Brouillon</span>
                <span>{calculerPourcentage(statuts.devisClients.brouillon, stats.devisClients.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.devisClients.brouillon, stats.devisClients.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>En attente</span>
                <span>{calculerPourcentage(statuts.devisClients.enAttente, stats.devisClients.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.devisClients.enAttente, stats.devisClients.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Envoyé</span>
                <span>{calculerPourcentage(statuts.devisClients.envoye, stats.devisClients.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.devisClients.envoye, stats.devisClients.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Refusé</span>
                <span>{calculerPourcentage(statuts.devisClients.refuse, stats.devisClients.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.devisClients.refuse, stats.devisClients.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Accepté</span>
                <span>{calculerPourcentage(statuts.devisClients.accepte, stats.devisClients.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.devisClients.accepte, stats.devisClients.total)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Expiré</span>
                <span>{calculerPourcentage(statuts.devisClients.expire, stats.devisClients.total).toFixed(0)} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${calculerPourcentage(statuts.devisClients.expire, stats.devisClients.total)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
      
  
        
        {/* Statistiques des clients */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-lg font-medium mb-4">Clients</h2>
          
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 mb-4">
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <div className="text-3xl font-bold">{clientStats.pourcentageActifs.toFixed(0)}%</div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="10" 
                    strokeDasharray={`${clientStats.pourcentageActifs * 2.83} 283`} 
                    strokeDashoffset="0" 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Nouveau client ce mois-ci</div>
              <div className="font-medium">{clientStats.nouveauCeMois}</div>
            </div>
            <div className="text-center mt-4">
              <div className="text-sm text-gray-500 mb-1">Client actif</div>
              <div className="font-medium text-green-600">
                <ArrowUp className="inline-block mr-1" size={16} />
                {clientStats.pourcentageActifs.toFixed(2)} %
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Factures et devis récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factures récentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Factures récentes</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facturesRecentes.length > 0 ? (
                  facturesRecentes.map((facture, index) => (
                    <tr key={facture.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {facture.numFacture}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getClientName(facture.client)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatMontant(facture.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${facture.status === 'Payé' ? 'bg-green-100 text-green-800' : 
                            facture.status === 'Envoyé' ? 'bg-blue-100 text-blue-800' : 
                            facture.status === 'En Retard' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {facture.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-500">
                          ...
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4">
                          <FileText className="h-12 w-12 text-gray-300" />
                        </div>
                        <p className="text-gray-500">Aucune donnée</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Devis récents */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Devis récents</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devisRecents.length > 0 ? (
                  devisRecents.map((devis, index) => (
                    <tr key={devis.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {devis.numFacture}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getClientName(devis.client)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatMontant(devis.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${devis.status === 'Accepté' ? 'bg-green-100 text-green-800' : 
                            devis.status === 'Envoyé' ? 'bg-blue-100 text-blue-800' : 
                            devis.status === 'Refusé' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {devis.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-500">
                          ...
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4">
                          <FileText className="h-12 w-12 text-gray-300" />
                        </div>
                        <p className="text-gray-500">Aucune donnée</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;