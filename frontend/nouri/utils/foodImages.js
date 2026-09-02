const PLACEHOLDER_IMAGES = {
  produce: '/assets/logos/foodmaps-logo.png',
  bakery: '/assets/logos/foodmaps-logo.png',
  default: '/assets/logos/foodmaps-logo.png',
};

export function assignFoodImage(row) {
  if (row?.image_url) return row;
  const cat = String(row?.category || 'default').toLowerCase();
  return { ...row, image_url: PLACEHOLDER_IMAGES[cat] || PLACEHOLDER_IMAGES.default };
}

export function assignImagestoRows(rows) {
  return (rows || []).map(assignFoodImage);
}
