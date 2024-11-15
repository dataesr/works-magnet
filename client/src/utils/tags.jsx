const getTagColor = (tag) => {
  if (tag.isDisabled) return 'beige-gris-galet';
  if (tag.source === 'ror') return 'brown-caramel';
  return 'brown-cafe-creme';
};

export {
  getTagColor
};
