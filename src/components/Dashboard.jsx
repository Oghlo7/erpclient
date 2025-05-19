import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertCircle, Users, FileCheck, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import useInvoiceStore from '../store/invoiceStore';
import useClientStore from '../store/clientStore';
import useQuoteStore from '../store/quoteStore';
import usePaymentStore from '../store/paymentStore';

const Dashboard = () => {
  // Récupérer les données depuis les stores
  const { invoices, fetchInvoicesByAdmin, updateInvoice } = useInvoiceStore();
  const { clients, fetchClientsByAdmin } = useClientStore();
  const { quotes, fetchQuotesByAdmin } = useQuoteStore();
  const { payments, fetchPaymentsByAdmin } = usePaymentStore();

  // États pour les statistiques
  const [stats, setStats] = useState({
    totalInvoices: 0,
    unpaidAmount: 0,
    invoiceStats: {
      pending: 0,
      rejected: 0,
      accepted: 0
    },
    quoteStats: {
      pending: 0,
      rejected: 0,
      accepted: 0
    },
    clientStats: {
      total: 0,
      newThisMonth: 0,
      activePercentage: 0
    },
    currentMonthRevenue: 0
  });

  // Charger les données au chargement du composant
  useEffect(() => {
    const loadData = async () => {
      await fetchInvoicesByAdmin();
      await fetchClientsByAdmin();
      await fetchQuotesByAdmin();
      await fetchPaymentsByAdmin();
    };
    
    loadData();
  }, [fetchInvoicesByAdmin, fetchClientsByAdmin, fetchQuotesByAdmin, fetchPaymentsByAdmin]);

  // Synchroniser les modifications des devis vers les factures
  useEffect(() => {
    if (quotes && invoices) {
      // Pour chaque devis, vérifier s'il existe une facture correspondante
      quotes.forEach(quote => {
        const matchingInvoices = invoices.filter(invoice => 
          invoice.client === quote.client && 
          invoice.numFacture === quote.numFacture
        );
        
        // Si des factures correspondantes sont trouvées, mettre à jour leurs informations
        matchingInvoices.forEach(invoice => {
          // Vérifier si les données sont différentes avant de mettre à jour
          if (
            invoice.client !== quote.client ||
            invoice.type !== quote.type ||
            invoice.total !== quote.total ||
            JSON.stringify(invoice.articles) !== JSON.stringify(quote.articles)
          ) {
            // Créer un objet avec les données mises à jour
            const updatedInvoice = {
              ...invoice,
              client: quote.client,
              type: quote.type,
              total: quote.total,
              articles: quote.articles
            };
            
            // Mettre à jour la facture
            updateInvoice(invoice.id, updatedInvoice);
          }
        });
      });
    }
  }, [quotes, invoices, updateInvoice]);

  // Calculer les statistiques lorsque les données sont chargées
  useEffect(() => {
    if (invoices && clients && quotes && payments) {
      calculateStats();
    }
  }, [invoices, clients, quotes, payments]);

  // Fonction pour calculer les statistiques
  const calculateStats = () => {
    // Date actuelle et premier jour du mois
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Statistiques des factures
    const invoiceStats = {
      pending: 0,
      rejected: 0,
      accepted: 0
    };
    
    let unpaidAmount = 0;
    let currentMonthRevenue = 0;
    
    invoices.forEach(invoice => {
      // Compter par statut
      switch(invoice.status) {
        case 'en attente':
          invoiceStats.pending++;
          break;
        case 'refusé':
          invoiceStats.rejected++;
          break;
        case 'accepté':
          invoiceStats.accepted++;
          // Calculer le revenu du mois en cours
          const invoiceDate = new Date(invoice.date);
          if (invoiceDate >= firstDayOfMonth) {
            currentMonthRevenue += parseFloat(invoice.total);
          }
          break;
        default:
          // Pour les autres statuts, on ne les compte pas
          break;
      }
      
      // Calculer le montant impayé pour les factures en attente ou refusées
      if (invoice.status === 'en attente' || invoice.status === 'refusé') {
        unpaidAmount += parseFloat(invoice.total) - parseFloat(invoice.paid || 0);
      }
    });
    
    // Statistiques des devis
    const quoteStats = {
      pending: 0,
      rejected: 0,
      accepted: 0
    };
    
    quotes.forEach(quote => {
      // Compter par statut
      switch(quote.status) {
        case 'en attente':
          quoteStats.pending++;
          break;
        case 'refusé':
          quoteStats.rejected++;
          break;
        case 'accepté':
          quoteStats.accepted++;
          break;
        default:
          // Pour les autres statuts (brouillon, envoyé, expiré), on ne les compte pas
          break;
      }
    });
    
    // Statistiques des clients
    const newClientsThisMonth = clients.filter(client => {
      const createdAt = new Date(client.created_at);
      return createdAt >= firstDayOfMonth;
    }).length;
    
    const activeClients = clients.filter(client => {
      // Un client est considéré comme actif s'il a une facture ou un devis dans les 3 derniers mois
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const hasRecentInvoice = invoices.some(invoice => 
        invoice.client === client.id && new Date(invoice.date) >= threeMonthsAgo
      );
      
      const hasRecentQuote = quotes.some(quote => 
        quote.client === client.id && new Date(quote.created_at) >= threeMonthsAgo
      );
      
      return hasRecentInvoice || hasRecentQuote;
    }).length;
    
    const activePercentage = clients.length > 0 
      ? (activeClients / clients.length) * 100 
      : 0;
    
    // Mettre à jour les statistiques
    setStats({
      totalInvoices: invoices.length,
      unpaidAmount,
      invoiceStats,
      quoteStats,
      clientStats: {
        total: clients.length,
        newThisMonth: newClientsThisMonth,
        activePercentage
      },
      currentMonthRevenue
    });
  };

  // Formater les montants en devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ma-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  // Calculer le pourcentage pour les barres de progression
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      
      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Factures ce mois-ci */}
        <div className="bg-white rounded-lg shadow p-6 flex items-start">
          <div className="mr-4 p-3 bg-blue-100 rounded-full">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Factures</h2>
            <p className="text-gray-500">Ce mois-ci</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatCurrency(stats.currentMonthRevenue)}
            </p>
          </div>
        </div>
        
        {/* Montant impayé */}
        <div className="bg-white rounded-lg shadow p-6 flex items-start">
          <div className="mr-4 p-3 bg-red-100 rounded-full">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Impayé</h2>
            <p className="text-gray-500">Non payé</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatCurrency(stats.unpaidAmount)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Statistiques des factures */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Factures</h2>
            <Link to="/invoice" className="text-blue-600 hover:underline text-sm">
              Voir tout
            </Link>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <circle cx="12" cy="12" r="10" fill="#EFF6FF" />
                <path 
                  d="M6 8h12M6 12h12M6 16h8" 
                  stroke="#3B82F6" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" 
                  stroke="#3B82F6" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">En attente</span>
                <span className="text-sm text-gray-600">{stats.invoiceStats.pending} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden transition-all duration-500 ease-in-out">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500 ease-in-out transform hover:scale-x-105" 
                  style={{ width: `${calculatePercentage(stats.invoiceStats.pending, stats.totalInvoices)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Refusé</span>
                <span className="text-sm text-gray-600">{stats.invoiceStats.rejected} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden transition-all duration-500 ease-in-out">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-in-out transform hover:scale-x-105" 
                  style={{ width: `${calculatePercentage(stats.invoiceStats.rejected, stats.totalInvoices)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Accepté</span>
                <span className="text-sm text-gray-600">{stats.invoiceStats.accepted} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden transition-all duration-500 ease-in-out">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-in-out transform hover:scale-x-105" 
                  style={{ width: `${calculatePercentage(stats.invoiceStats.accepted, stats.totalInvoices)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistiques des devis */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Devis pour les clients</h2>
            <Link to="/quote" className="text-blue-600 hover:underline text-sm">
              Voir tout
            </Link>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <circle cx="12" cy="12" r="10" fill="#F0FDF4" />
                <path 
                  d="M9 7H6C5.44772 7 5 7.44772 5 8V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V8C19 7.44772 18.5523 7 18 7H15M9 7V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7M9 7H15" 
                  stroke="#22C55E" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
                <path 
                  d="M12 12H15M12 16H15M9 12H9.01M9 16H9.01" 
                  stroke="#22C55E" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">En attente</span>
                <span className="text-sm text-gray-600">{stats.quoteStats.pending} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden transition-all duration-500 ease-in-out">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500 ease-in-out transform hover:scale-x-105" 
                  style={{ width: `${calculatePercentage(stats.quoteStats.pending, quotes.length)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Refusé</span>
                <span className="text-sm text-gray-600">{stats.quoteStats.rejected} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden transition-all duration-500 ease-in-out">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-in-out transform hover:scale-x-105" 
                  style={{ width: `${calculatePercentage(stats.quoteStats.rejected, quotes.length)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Accepté</span>
                <span className="text-sm text-gray-600">{stats.quoteStats.accepted} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden transition-all duration-500 ease-in-out">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-in-out transform hover:scale-x-105" 
                  style={{ width: `${calculatePercentage(stats.quoteStats.accepted, quotes.length)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistiques des clients */}
        <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Clients</h2>
            <Link to="/client" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200">
              Voir tout
            </Link>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                {/* Cercle de fond gris */}
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                {/* Cercle de progression violet */}
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeDasharray={`${stats.clientStats.activePercentage}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-in-out"
                />
                {/* Icône de personnes au centre */}
                <g transform="translate(10, 10) scale(0.8)">
                  <path 
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" 
                    fill="none" 
                    stroke="#111827" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <circle 
                    cx="9" 
                    cy="7" 
                    r="4" 
                    fill="none" 
                    stroke="#111827" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M23 21v-2a4 4 0 0 0-3-3.87" 
                    fill="none" 
                    stroke="#111827" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M16 3.13a4 4 0 0 1 0 7.75" 
                    fill="none" 
                    stroke="#111827" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="text-center bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 mb-2 font-medium">Nouveau client ce mois-ci</p>
              <p className="text-4xl font-bold text-gray-900">{stats.clientStats.newThisMonth}</p>
            </div>
            
            <div className="text-center bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 mb-2 font-medium">Client actif</p>
              <p className="text-2xl font-semibold text-green-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                {stats.clientStats.activePercentage.toFixed(2)} %
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dernières transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Derniers paiements</h2>
          <Link to="/payment" className="text-blue-600 hover:underline text-sm">
            Voir tout
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.slice(0, 5).map((payment, index) => {
                // Trouver le client correspondant au paiement
                const client = clients.find(c => c.id === payment.client);
                
                // Trouver la facture correspondante
                const invoice = invoices.find(i => i.id === payment.invoice);
                
                // Si le client n'est pas trouvé directement, chercher le client associé à la facture
                const clientFromInvoice = !client && invoice ? 
                  clients.find(c => c.id === invoice.client) : null;
                
                // Trouver le devis correspondant à la facture
                const quote = invoice && invoice.quote ? 
                  quotes.find(q => q.id === invoice.quote) : null;
                
                // Déterminer le statut à afficher
                let status = "En attente";
                let statusClass = "bg-yellow-100 text-yellow-800";
                
                if (quote) {
                  // Si un devis est trouvé, utiliser son statut
                  switch(quote.status) {
                    case 'Refusé':
                    case 'refusé':
                      status = "Refusé";
                      statusClass = "bg-red-100 text-red-800";
                      break;
                    case 'Accepté':
                    case 'accepté':
                      status = "Accepté";
                      statusClass = "bg-green-100 text-green-800";
                      break;
                    case 'En attente':
                    case 'en attente':
                      status = "En attente";
                      statusClass = "bg-yellow-100 text-yellow-800";
                      break;
                    default:
                      status = "En attente";
                      statusClass = "bg-yellow-100 text-yellow-800";
                  }
                } else if (invoice) {
                  // Si seulement une facture est trouvée, utiliser son statut
                  switch(invoice.status) {
                    case 'Refusé':
                    case 'refusé':
                      status = "Refusé";
                      statusClass = "bg-red-100 text-red-800";
                      break;
                    case 'Accepté':
                    case 'accepté':
                    case 'payé':
                    case 'Payé':
                      status = "Accepté";
                      statusClass = "bg-green-100 text-green-800";
                      break;
                    case 'En attente':
                    case 'en attente':
                      status = "En attente";
                      statusClass = "bg-yellow-100 text-yellow-800";
                      break;
                    default:
                      status = "En attente";
                      statusClass = "bg-yellow-100 text-yellow-800";
                  }
                }
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {client 
                          ? `${client.first_name} ${client.last_name}` 
                          : clientFromInvoice 
                            ? `${clientFromInvoice.first_name} ${clientFromInvoice.last_name}`
                            : 'Client inconnu'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice ? invoice.numFacture : payment.invoice || 'Facture inconnue'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(payment.montant || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {payments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun paiement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;