const crypto = require("crypto");

const ASSET_BASE_URL = process.env.ASSET_BASE_URL;


const getInitials = (name = "") => {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
};


const getColorFromSeed = (seed) => {
  const hash = crypto.createHash("md5").update(String(seed)).digest("hex");
  return hash.substring(0, 6); // valid hex color
};

const buildAssetUrl = ({ avatar, name, email, id }) => {
  // 1️ Uploaded avatar (stored image)
  if (avatar) {
    return `${ASSET_BASE_URL}/uploads/avatars/${avatar}`;
  }

  // 2️ Generated default avatar (dynamic, not stored)
  const initials = getInitials(name);
  const seed = email || id || name || "user";
  const background = getColorFromSeed(seed);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=${background}&color=ffffff&size=256&bold=true`;
};

module.exports = buildAssetUrl;
