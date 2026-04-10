export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

export type ProductSize = (typeof PRODUCT_SIZES)[number];
