const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const getInitials = require('./getInitials');
const getAvatarColor = require('./getAvatarColor');

const AVATAR_SIZE = 256;

const generateDefaultAvatar = async ({ userId, name }) => {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(userId);

  const canvas = createCanvas(AVATAR_SIZE, AVATAR_SIZE);
  const ctx = canvas.getContext('2d');

  // background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);

  // text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 96px Sans';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, AVATAR_SIZE / 2, AVATAR_SIZE / 2);

  // file path
  const fileName = `default_u_${userId}.png`;
  const relativePath = `${fileName}`;
  const fullPath = path.join(__dirname, '../../', relativePath);

  // ensure folder exists
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  // write file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(fullPath, buffer);

  return relativePath;
};

module.exports = generateDefaultAvatar;
