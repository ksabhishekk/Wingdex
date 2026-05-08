export const getRarityWeight = (rarity) => {
  if (!rarity) return 0;
  const r = rarity.toLowerCase();
  if (r === 'rare') return 3;
  if (r === 'uncommon') return 2;
  if (r === 'common') return 1;
  return 0;
};

export const formatBirdName = (name) => {
  if (!name) return 'Unknown Bird';
  return name.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};
