'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import { LogOut, Search, Filter, Eye, Edit, Trash2, Package, Phone, User, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    productName: {
      fr: string;
      ar: string;
    };
    size: string;
    color: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  totalDiscount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  totalItems: number;
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

export default function AdminOrders() {
  const { lang } = useLanguage();
  const { logout } = useAdminAuth();
  const t = useTranslations();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmé' },
    { value: 'processing', label: 'En traitement' },
    { value: 'shipped', label: 'Expédié' },
    { value: 'delivered', label: 'Livré' },
    { value: 'cancelled', label: 'Annulé' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        status: selectedStatus === 'all' ? '' : selectedStatus,
        search: searchQuery,
        page: currentPage.toString(),
        limit: '20'
      });
      
      const response = await fetch(`/api/orders?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data: OrdersResponse = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditStatus = (orderId: string, currentStatus: string) => {
    setEditingOrder(orderId);
    setEditingStatus(currentStatus);
  };

  const handleSaveStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editingStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: editingStatus as any }
              : order
          )
        );
        
        setEditingOrder(null);
        setEditingStatus('');
        alert('Statut mis à jour avec succès');
      } else {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (err) {
      alert(`Erreur lors de la mise à jour: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditingStatus('');
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the order from the local state
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        alert('Commande supprimée avec succès');
      } else {
        throw new Error(data.message || 'Failed to delete order');
      }
    } catch (err) {
      alert(`Erreur lors de la suppression: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-montserrat">
            Gestion des Commandes
          </h1>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={() => handleSearch(searchQuery)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium shadow-md text-sm sm:text-base flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{t("search")}</span>
            </button>

            {/* Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              Effacer
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-lg text-gray-600">{t("loadingOrders")}</div>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchOrders}
              className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📦</div>
            <p className="text-gray-500 text-lg sm:text-xl mb-4 sm:mb-6 px-2">
              Aucune commande trouvée
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              <div className="p-3 sm:p-4 space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-gold" />
                        <span className="text-sm font-medium text-black">#{order.orderNumber}</span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[order.status]
                      }`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{order.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{order.customer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-black">TND{order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {order.totalItems} article(s)
                        </span>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title={t("view")}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEditStatus(order._id, order.status)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title={t("editStatus")}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title={t("delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("client")}
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gold" />
                          <span className="text-sm font-medium text-black">#{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-black">{order.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{order.customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {order.totalItems} article(s)
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">
                          TND{order.totalAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                          statusColors[order.status]
                        }`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title={t("view")}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEditStatus(order._id, order.status)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title={t("editStatus")}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title={t("delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
              >
                Précédent
              </button>
              <span className="px-3 sm:px-4 py-2 text-sm text-gray-700">
                Page {pagination.currentPage} sur {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-semibold text-black mb-4">{t("editStatusTitle")}</h3>
            <select
              value={editingStatus}
              onChange={(e) => setEditingStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base mb-4"
            >
              {statusOptions.filter(option => option.value !== 'all').map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={() => handleSaveStatus(editingOrder)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium text-sm sm:text-base"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
