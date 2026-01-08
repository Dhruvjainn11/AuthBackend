const COLORS = [
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#f39c12',
  '#e67e22',
  '#e74c3c',
  '#16a085',
  '#27ae60',
];

const getAvatarColor = (userId) => {
  return COLORS[userId % COLORS.length];
};

module.exports = getAvatarColor;
