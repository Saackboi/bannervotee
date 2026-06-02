export function getBannerAssetPath(fileName: string): string {
  const cleanName = fileName.trim().replace(/^\/+/, '');
  return `/banners/${cleanName}`;
}

export function getOptimizedBannerAssetPath(imageUrl: string): string {
  return imageUrl.replace(/\.png$/i, '.webp');
}
