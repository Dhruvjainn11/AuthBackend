const getInitials = (name = '') => {
  const cleaned = name.trim().replace(/\s+/g, ' ');

  if (!cleaned) return 'U';

  const parts = cleaned.split(' ');

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return (
    parts[0][0].toUpperCase() +
    parts[parts.length - 1][0].toUpperCase()
  );
};

module.exports = getInitials;
