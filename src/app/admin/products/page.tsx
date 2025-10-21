'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Edit, Trash2, LogOut } from 'lucide-react';

interface Product {
  _id: string;
  name: {
    fr: string;
    ar: string;
  };
  price: number;
  category: string;
  availability: boolean;
  images: string[];
  createdAt: string;
}

export default function AdminProducts() {
  const { lang } = useLanguage();
  const { logout } = useAdminAuth();
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    setDeleteLoading(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the product from the list
        setProducts(prev => prev.filter(product => product._id !== productId));
        alert('Produit supprimé avec succès !');
      } else {
        const error = await response.json();
        alert(`Erreur : ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Échec de la suppression du produit');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offwhite py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-lg text-gray-600">{t("loadingProducts")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-montserrat">
            Gestion des Produits
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/admin/product/addNew/form"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium shadow-md text-center text-sm sm:text-base"
            >
              Ajouter un Produit
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📦</div>
            <p className="text-gray-500 text-lg sm:text-xl mb-4 sm:mb-6 px-2">
              {t("noProductsForNow")}
            </p>
            <Link
              href="/admin/product/addNew/form"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium shadow-md text-sm sm:text-base"
            >
              Ajouter le Premier Produit
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              <div className="p-3 sm:p-4 space-y-3">
                {products.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name[lang as keyof typeof product.name]}
                          className="h-16 w-16 object-cover rounded-lg shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-400 text-xs text-center">Aucune Image</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-black truncate">
                          {product.name[lang as keyof typeof product.name]}
                        </h3>
                        <p className="text-sm text-gray-600">TND{product.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.availability
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.availability ? 'Disponible' : 'Indisponible'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/product/edit/${product._id}`}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title={t("edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleteLoading === product._id}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title={t("delete")}
                        >
                          {deleteLoading === product._id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
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
                      Image
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
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
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name[lang as keyof typeof product.name]}
                            className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs text-center">Aucune Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">
                          {product.name[lang as keyof typeof product.name]}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm text-black font-medium">
                          TND{product.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {product.category}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                          product.availability
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.availability ? 'Disponible' : 'Indisponible'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/product/edit/${product._id}`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title={t("edit")}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deleteLoading === product._id}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            title={t("delete")}
                          >
                            {deleteLoading === product._id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
      </div>
    </div>
  );
}
