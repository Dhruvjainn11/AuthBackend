const buildAssetUrl = (relativePath) => {
    
  if (!relativePath) return null;

  if (!process.env.ASSET_BASE_URL) {
    throw new Error("ASSET_BASE_URL is not defined");
  }

  const base = process.env.ASSET_BASE_URL.replace(/\/$/, "");
  const path = relativePath.replace(/^\//, "");

  return `${base}/${path}`;
};

module.exports = buildAssetUrl;
