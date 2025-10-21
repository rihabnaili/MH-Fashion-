'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { LogOut, ArrowLeft, Edit, Save, X, Package, Phone, User, Calendar, DollarSign, MapPin, Truck } from 'lucide-react';
import ProductImageGallery from '@/app/components/ui/ProductImageGallery';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  productId: string;
  productName: {
    fr: string;
    ar: string;
  };
  price: number;
  originalPrice?: number;
  size: string;
  color: string;
  quantity: number;
  images: string[];
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  totalDiscount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalItems: number;
}

const statusOptions = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmé', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'En traitement', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Expédié', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Livré', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-100 text-red-800' }
];

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const { logout } = useAdminAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<string>('');
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
        setEditedStatus(data.data.status);
        setEditedNotes(data.data.notes || '');
      } else {
        throw new Error(data.message || 'Failed to fetch order');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editedStatus,
          notes: editedNotes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
        setIsEditing(false);
        alert('Commande mise à jour avec succès');
      } else {
        throw new Error(data.message || 'Failed to update order');
      }
    } catch (err) {
      alert(`Erreur lors de la mise à jour: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (order) {
      setEditedStatus(order.status);
      setEditedNotes(order.notes || '');
    }
    setIsEditing(false);
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

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-montserrat">
              Commande #{order?.orderNumber}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-lg text-gray-600">{t("loadingOrder")}</div>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchOrder}
              className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : !order ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-red-600 text-lg">Commande non trouvée</div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Order Status Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-black">
                      Statut de la Commande
                    </h2>
                    <p className="text-sm text-gray-600">
                      Dernière mise à jour: {new Date(order.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 font-medium text-sm sm:text-base"
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium text-sm sm:text-base"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <span className={`inline-flex px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-full ${
                      statusOptions.find(opt => opt.value === order.status)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t("edit")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6">{t("customerInfo")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-medium text-black">{order.customer.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium text-black">{order.customer.phone}</p>
                  </div>
                </div>
                {order.customer.address && (
                  <div className="flex items-center space-x-3 sm:col-span-2 lg:col-span-1">
                    <MapPin className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-medium text-black">{order.customer.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6">Articles Commandés</h3>
              <div className="space-y-4 sm:space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <ProductImageGallery
                          images={item.images || ['/home-media/set.jpg']}
                          productName={item.productName[lang as 'fr' | 'ar'] || item.productName.fr}
                          className="w-16 h-16 sm:w-20 sm:h-20"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-black text-sm sm:text-base mb-1">
                          {item.productName[lang as keyof typeof item.productName] || item.productName.fr}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Taille:</span> {item.size}
                          </div>
                          <div>
                            <span className="font-medium">Couleur:</span> {item.color}
                          </div>
                          <div>
                            <span className="font-medium">Quantité:</span> {item.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Prix:</span> TND{item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6">Résumé de la Commande</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-sm text-gray-600">Date de commande</p>
                    <p className="font-medium text-black">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-sm text-gray-600">Total articles</p>
                    <p className="font-medium text-black">{order.totalItems}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-sm text-gray-600">Montant total</p>
                    <p className="font-medium text-black">TND{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-sm text-gray-600">Remise</p>
                      <p className="font-medium text-green-600">-TND{order.totalDiscount.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-4">Notes</h3>
                <p className="text-gray-700 text-sm sm:text-base">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
