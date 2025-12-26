'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { LogOut } from 'lucide-react';

export default function AdminHome() {
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-4 sm:mb-6 lg:mb-8 font-montserrat">
            Tableau de Bord Admin
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto px-2">
            Gérez vos produits, ajoutez de nouveaux articles et surveillez votre boutique en ligne
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
            <Link
              href="/admin/products"
              className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">Gestion des Produits</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Consultez, modifiez et supprimez vos produits existants
              </p>
            </Link>

            <Link
              href="/admin/product/addNew/form"
              className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">➕</div>
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">Ajouter un Produit</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Créez de nouveaux produits avec images et descriptions
              </p>
            </Link>

            <Link
              href="/admin/statistics"
              className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📊</div>
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">Statistiques</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Surveillez les performances de votre boutique
              </p>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
            <Link
              href="/admin/products"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gold text-black rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium shadow-md text-sm sm:text-base"
            >
              Commencer la Gestion
            </Link>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
