import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

export interface Product {
  _id: string;
  name: {
    fr: string;
    ar: string;
  };
  slug: string;
  price: number;
  originalPrice?: number;
  discount: number;
  images: string[];
  category: string;
  availability: boolean;
  size?: string[];
  color?: string[];
  description?: {
    fr: string;
    ar: string;
  };
  createdAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

interface UseProductsOptions {
  category?: string;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  autoFetch?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProductsResponse['data']['pagination'] | null>(null);
  
  const {
    category = 'all',
    limit = 12,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    autoFetch = true
  } = options;

  const fetchProducts = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        category,
        limit: limit.toString(),
        page: page.toString(),
        search,
        sortBy,
        sortOrder
      });
      
      const response = await fetch(`/api/products?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data: ProductsResponse | ErrorResponse = await response.json();
      
      if (data.success) {
        const successData = data as ProductsResponse;
        setProducts(successData.data.products);
        setPagination(successData.data.pagination);
      } else {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, limit, search, sortBy, sortOrder]);

  const refetch = () => fetchProducts(1);
  
  const loadMore = () => {
    if (pagination?.hasNextPage && !isLoading) {
      fetchProducts(pagination.currentPage + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      fetchProducts(page);
    }
  };

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(1);
    }
  }, [autoFetch, fetchProducts]);

  return {
    products,
    isLoading,
    error,
    pagination,
    fetchProducts,
    refetch,
    loadMore,
    goToPage
  };
}
