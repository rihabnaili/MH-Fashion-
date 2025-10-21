import React from 'react';

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// Generate metadata for category pages
export async function generateMetadata({ params }: { params: { category: string } }) {
  const categorySlug = params.category;
  
  // Map category slugs to display names
  const categoryNames: Record<string, string> = {
    'ensembles': 'Ensembles',
    't-shirts-polos': 'T-shirts & Polos',
    'shorts-pantalons': 'Shorts & Pantalons',
    'chemises': 'Chemises',
    'packs-offres-speciales': 'Packs & Offres Spéciales',
    'promos': 'Promotions',
    'nouveautes': 'Nouveautés'
  };

  const categoryName = categoryNames[categorySlug] || 'Catégorie';

  return {
    title: `${categoryName} - MH Fashion`,
    description: `Découvrez notre collection de ${categoryName.toLowerCase()} chez MH Fashion.`,
  };
}
