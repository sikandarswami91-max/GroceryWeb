// Category image registry mapping slugs and normalized names to high-definition grocery photography
export const DEFAULT_FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80';

export const CATEGORY_IMAGE_MAP = {
  // Fresh Fruits: basket of fresh apples, bananas, oranges, grapes
  'fresh-fruits':
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'fruits':
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',

  // Fresh Vegetables: fresh tomatoes, potatoes, carrots, capsicum, leafy vegetables
  'fresh-vegetables':
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'vegetables':
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',

  // Dairy & Breakfast: milk, paneer, butter, cheese, eggs
  'dairy-breakfast':
    'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
  'dairy':
    'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',

  // Rice & Grains: rice, wheat, oats and grains
  'rice-grains':
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  'grains':
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',

  // Dals & Pulses: different pulses and lentils
  'pulses-dals':
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
  'dals-pulses':
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
  'dals':
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',

  // Oil & Ghee: cooking oil and ghee
  'oil-ghee':
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  'oils':
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',

  // Snacks & Biscuits: chips, biscuits and namkeen
  'snacks-biscuits':
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
  'snacks':
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',

  // Beverages: juice, soft drinks and beverages
  'beverages':
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
  'drinks':
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',

  // Tea & Coffee: tea leaves, tea cup and coffee
  'tea-coffee':
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
  'coffee':
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',

  // Dry Fruits & Nuts: almonds, cashews, raisins and walnuts
  'dry-fruits-nuts':
    'https://images.unsplash.com/photo-1536591375315-1b8384214f4a?auto=format&fit=crop&w=600&q=80',
  'nuts':
    'https://images.unsplash.com/photo-1536591375315-1b8384214f4a?auto=format&fit=crop&w=600&q=80',

  // Bakery: bread, cookies and bakery products
  'bakery':
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'bread':
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',

  // Personal Care: shampoo, soap, toothpaste
  'personal-care':
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',

  // Household Essentials: cleaning and household products
  'household-essentials':
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
  'household':
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',

  // Atta & Flour: wheat flour and flour products
  'atta-flour-sooji':
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  'atta-flour':
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',

  // Spices & Masala: colorful Indian spices
  'spices-masala':
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  'spices':
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
};

/**
 * Returns a high-definition image URL for any category, checking the category's
 * attached image first, then the slug/name mapping, and finally a safe grocery fallback.
 */
export function getCategoryImage(category) {
  if (!category) return DEFAULT_FALLBACK_CATEGORY_IMAGE;

  if (category.image?.url && category.image.url.trim().length > 0) {
    return category.image.url;
  }

  const slugKey = (category.slug || '').toLowerCase().trim();
  if (CATEGORY_IMAGE_MAP[slugKey]) {
    return CATEGORY_IMAGE_MAP[slugKey];
  }

  const nameKey = (category.name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  if (CATEGORY_IMAGE_MAP[nameKey]) {
    return CATEGORY_IMAGE_MAP[nameKey];
  }

  // Partial matches
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (slugKey.includes(key) || nameKey.includes(key) || key.includes(slugKey)) {
      return url;
    }
  }

  return DEFAULT_FALLBACK_CATEGORY_IMAGE;
}

export const DEFAULT_15_CATEGORIES = [
  {
    name: 'Fresh Fruits',
    slug: 'fresh-fruits',
    description: 'Farm-fresh apples, bananas, sweet oranges, and seasonal berries',
    image: { url: CATEGORY_IMAGE_MAP['fresh-fruits'] },
  },
  {
    name: 'Fresh Vegetables',
    slug: 'fresh-vegetables',
    description: 'Crisp green vegetables, tomatoes, potatoes, and daily essentials',
    image: { url: CATEGORY_IMAGE_MAP['fresh-vegetables'] },
  },
  {
    name: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    description: 'Pure milk, paneer, butter, cheese, and farm-fresh eggs',
    image: { url: CATEGORY_IMAGE_MAP['dairy-breakfast'] },
  },
  {
    name: 'Rice & Grains',
    slug: 'rice-grains',
    description: 'Himalayan basmati, brown rice, oats, and whole grains',
    image: { url: CATEGORY_IMAGE_MAP['rice-grains'] },
  },
  {
    name: 'Dals & Pulses',
    slug: 'pulses-dals',
    description: 'Protein-rich toor dal, moong, chana, and Kashmiri rajma',
    image: { url: CATEGORY_IMAGE_MAP['pulses-dals'] },
  },
  {
    name: 'Oil & Ghee',
    slug: 'oil-ghee',
    description: 'Cold-pressed mustard oil, sunflower oil, and pure desi ghee',
    image: { url: CATEGORY_IMAGE_MAP['oil-ghee'] },
  },
  {
    name: 'Snacks & Biscuits',
    slug: 'snacks-biscuits',
    description: 'Crisp salted chips, cookies, and traditional namkeen',
    image: { url: CATEGORY_IMAGE_MAP['snacks-biscuits'] },
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    description: 'Fruit juices, sparkling coolers, and refreshing drinks',
    image: { url: CATEGORY_IMAGE_MAP['beverages'] },
  },
  {
    name: 'Tea & Coffee',
    slug: 'tea-coffee',
    description: 'Assam leaf tea, aromatic roast coffee, and green tea',
    image: { url: CATEGORY_IMAGE_MAP['tea-coffee'] },
  },
  {
    name: 'Dry Fruits & Nuts',
    slug: 'dry-fruits-nuts',
    description: 'California almonds, cashews, raisins, and walnuts',
    image: { url: CATEGORY_IMAGE_MAP['dry-fruits-nuts'] },
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    description: 'Fresh artisanal bread, burger buns, and tea cookies',
    image: { url: CATEGORY_IMAGE_MAP['bakery'] },
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Soaps, herbal shampoos, toothpastes, and skincare',
    image: { url: CATEGORY_IMAGE_MAP['personal-care'] },
  },
  {
    name: 'Household Essentials',
    slug: 'household-essentials',
    description: 'Cleaning liquids, dishwash detergents, and paper towels',
    image: { url: CATEGORY_IMAGE_MAP['household-essentials'] },
  },
  {
    name: 'Atta & Flour',
    slug: 'atta-flour-sooji',
    description: 'Sharbati whole wheat atta, sooji, and pure besan',
    image: { url: CATEGORY_IMAGE_MAP['atta-flour-sooji'] },
  },
  {
    name: 'Spices & Masala',
    slug: 'spices-masala',
    description: 'Turmeric, red chilli powder, jeera, and garam masala',
    image: { url: CATEGORY_IMAGE_MAP['spices-masala'] },
  },
];
