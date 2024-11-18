const getTagColor = (tag) => {
  if (tag.isDisabled) return 'beige-gris-galet';
  if (tag.source === 'ror') return 'green-menthe';
  return 'green-archipel';
};

export {
  getTagColor,
};
