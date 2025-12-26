'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Users, 
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface StatisticsData {
  period: string;
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalDiscount: number;
    completedRevenue: number;
    averageOrderValue: number;
    totalItemsSold: number;
  };
  orders: {
    byStatus: Record<string, number>;
    byDate: Record<string, number>;
    recentCount: number;
  };
  revenue: {
    byDate: Record<string, number>;
    total: number;
    completed: number;
  };
  products: {
    total: number;
    available: number;
    outOfStock: number;
    byCategory: Record<string, number>;
  };
  topProducts: Array<{
    productId: string;
    name: { fr: string; ar: string };
    quantity: number;
    revenue: number;
  }>;
}

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('all');

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/statistics?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to load statistics');
      }
    } catch (err) {
      setError('Error loading statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ensembles: 'Ensembles',
      tShirtsPolos: 'T-shirts & Polos',
      shortsPantalons: 'Shorts & Pantalons',
      chemises: 'Chemises',
      packsOffresSpeciales: 'Packs & Offres',
      promos: 'Promotions',
      nouveautes: 'Nouveautés'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStatistics}
            className="px-4 py-2 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 font-montserrat">
            Statistiques
          </h1>
          
          {/* Period Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'today', label: "Aujourd'hui" },
              { value: 'week', label: '7 derniers jours' },
              { value: 'month', label: '30 derniers jours' },
              { value: 'all', label: 'Tout' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === value
                    ? 'bg-gold text-black'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              <span className="text-xs text-gray-500">Commandes</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">{data.overview.totalOrders}</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              <span className="text-xs text-gray-500">Revenu Total</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">
              {formatCurrency(data.overview.totalRevenue)}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              <span className="text-xs text-gray-500">Revenu Complet</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">
              {formatCurrency(data.overview.completedRevenue)}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              <span className="text-xs text-gray-500">Panier Moyen</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">
              {formatCurrency(data.overview.averageOrderValue)}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
              <span className="text-xs text-gray-500">Articles Vendus</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">{data.overview.totalItemsSold}</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              <span className="text-xs text-gray-500">Produits</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">{data.products.total}</p>
          </div>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Orders by Status */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gold" />
              Commandes par Statut
            </h2>
            <div className="space-y-3">
              {Object.entries(data.orders.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-black">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products by Category */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gold" />
              Produits par Catégorie
            </h2>
            <div className="space-y-3">
              {Object.entries(data.products.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700">{getCategoryLabel(category)}</span>
                  <span className="text-lg font-bold text-black">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Stock Status */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-500" />
              Produits Disponibles
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-green-600">{data.products.available}</p>
          </div>
        </div>

        {/* Top Products */}
        {data.topProducts.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-gold" />
              Top Produits Vendus
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantité</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((product, index) => (
                    <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center mr-3">
                            {index + 1}
                          </span>
                          <span className="text-gray-900">{product.name.fr || product.name.ar}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-700">{product.quantity}</td>
                      <td className="text-right py-3 px-4 font-semibold text-black">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

